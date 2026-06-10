#!/bin/bash
# process_drone.sh — Process new drone photos into tiles + buildings
# Usage: ./scripts/process_drone.sh /path/to/photos/
set -e

PHOTO_DIR="${1:?Usage: process_drone.sh /path/to/photos/}"
REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TILE_DIR="$REPO_DIR/drone-tiles/v2"
BATCH_SIZE=30

echo "=== KP Solar Pro — Drone Processing Pipeline ==="
echo "Photos: $PHOTO_DIR"
echo "Repo: $REPO_DIR"

PHOTO_COUNT=$(ls "$PHOTO_DIR"/*.JPG 2>/dev/null | wc -l | tr -d ' ')
echo "Found $PHOTO_COUNT photos"
[ "$PHOTO_COUNT" -eq 0 ] && echo "ERROR: No JPG files" && exit 1

echo "Extracting metadata..."
exiftool -csv -GPSLatitude -GPSLongitude -RelativeAltitude -GimbalPitchDegree \
    "$PHOTO_DIR"/*.JPG > /tmp/drone-meta.csv 2>/dev/null

echo "Splitting into batches of $BATCH_SIZE..."
BATCH_NUM=0
python3 -c "
import os, shutil
photos = sorted([f for f in os.listdir('$PHOTO_DIR') if f.upper().endswith('.JPG')])
for i in range(0, len(photos), $BATCH_SIZE):
    batch = photos[i:i+$BATCH_SIZE]
    d = f'/tmp/odm-new-{i//$BATCH_SIZE}/code/images'
    os.makedirs(d, exist_ok=True)
    for p in batch:
        shutil.copy2(os.path.join('$PHOTO_DIR', p), os.path.join(d, p))
    print(f'/tmp/odm-new-{i//$BATCH_SIZE}')
" | while read batch_dir; do
    echo "Processing batch: $batch_dir ($(ls $batch_dir/code/images/*.JPG | wc -l) photos)"

    docker run --rm -v "$batch_dir:/datasets" opendronemap/odm \
        --project-path /datasets \
        --orthophoto-resolution 10 \
        --feature-quality low \
        --pc-quality lowest \
        --min-num-features 4000 \
        --force-gps \
        --skip-3dmodel \
        --max-concurrency 1 2>&1 | grep -E "(Finished|ERROR)" || true

    if [ -f "$batch_dir/code/odm_orthophoto/odm_orthophoto.tif" ]; then
        gdalwarp -t_srs EPSG:4326 -r bilinear \
            "$batch_dir/code/odm_orthophoto/odm_orthophoto.tif" \
            "/tmp/ortho-new-${BATCH_NUM}.tif" 2>/dev/null
        BATCH_NUM=$((BATCH_NUM + 1))
        echo "  Orthomosaic $BATCH_NUM ready"
    fi
done

echo "Merging orthomosaics..."
ORTHO_FILES=$(ls /tmp/ortho-new-*.tif 2>/dev/null)
if [ -z "$ORTHO_FILES" ]; then
    echo "ERROR: No orthomosaics generated"; exit 1
fi
gdal_merge.py -o /tmp/ortho-merged.tif $ORTHO_FILES -co COMPRESS=LZW 2>/dev/null

echo "Generating tiles (zoom 18-19)..."
gdal2tiles.py -z 18-19 -w none -r bilinear --xyz /tmp/ortho-merged.tif /tmp/new-tiles/ 2>/dev/null

echo "Cleaning nodata tiles..."
python3 -c "
import os, cv2, numpy as np
removed = 0
for root, dirs, files in os.walk('/tmp/new-tiles'):
    for f in files:
        if not f.endswith('.png'): continue
        path = os.path.join(root, f)
        img = cv2.imread(path, cv2.IMREAD_UNCHANGED)
        if img is None: os.remove(path); removed += 1; continue
        if img.shape[2] == 4:
            alpha = img[:,:,3]
            if np.sum(alpha < 128) / alpha.size > 0.5:
                os.remove(path); removed += 1; continue
        b,g,r = img[:,:,0], img[:,:,1], img[:,:,2]
        orange = (r > 130) & (g > 80) & (g < 220) & (b < 140)
        gray = cv2.cvtColor(img[:,:,:3], cv2.COLOR_BGR2GRAY)
        local_var = cv2.blur((gray.astype(float))**2, (5,5)) - cv2.blur(gray.astype(float), (5,5))**2
        nodata = orange & (local_var < 50)
        if img.shape[2] == 4 and np.sum(nodata) > 0:
            img[:,:,3][nodata] = 0
            cv2.imwrite(path, img)
print(f'Removed {removed} nodata tiles')
"

echo "Merging with existing tiles..."
cp -r /tmp/new-tiles/* "$TILE_DIR/" 2>/dev/null || true

echo "Detecting buildings in new coverage..."
python3 "$REPO_DIR/scripts/kp_building_pipeline.py" --phase discover --max-tiles 500

cd "$REPO_DIR"
git add drone-tiles/v2/ scripts/data/
git commit -m "drone: add new tiles from $(basename $PHOTO_DIR)" --allow-empty
git push origin main

echo "=== DONE ==="
echo "Check https://index.bustan-energy.com/platform/pro/"
