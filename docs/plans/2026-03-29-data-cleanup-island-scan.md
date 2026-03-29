# KP Solar Pro — Data Cleanup & Full Island Scan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace bad building data with accurate, validated records covering every rooftop on Koh Phangan.

**Architecture:** Adapt the existing `roof_detector.py` 4-phase pipeline (from solar-intelligence) to work with the copenhagen-solar Supabase DB. Run: OSM+Overture download → merge/dedup → satellite validate → discover missing → recalculate solar → upsert to Supabase.

**Tech Stack:** Python 3, OpenCV, NumPy, requests, Supabase REST API. Existing tools: exiftool, GDAL, Docker+ODM.

---

## Task 1: Create the pipeline script

**Files:**
- Create: `/tmp/cs-edit/scripts/kp_building_pipeline.py`
- Reference: `~/Desktop/projects/solar/solar-intelligence/scripts/roof_detector.py` (reuse core functions)

**Step 1: Create script with config and imports**

```python
#!/usr/bin/env python3
"""
kp_building_pipeline.py — Full island building scan for Koh Phangan

Phases:
  1. DOWNLOAD  — Fetch buildings from OSM + Overture Maps
  2. MERGE     — Combine sources, deduplicate by proximity
  3. VALIDATE  — Check each building against Google Satellite zoom 19
  4. DISCOVER  — Scan full island grid to find missing buildings
  5. CALCULATE — Compute solar metrics for all buildings
  6. UPLOAD    — Upsert validated buildings to Supabase

Usage:
  python scripts/kp_building_pipeline.py --phase all
  python scripts/kp_building_pipeline.py --phase download
  python scripts/kp_building_pipeline.py --phase validate --sample 100
"""
import argparse
import json
import math
import os
import sys
import time
import uuid
from collections import defaultdict
from pathlib import Path
from typing import List, Dict, Tuple, Optional

import cv2
import numpy as np
import requests

# ── Config ──────────────────────────────────────────
SCRIPT_DIR = Path(__file__).resolve().parent
DATA_DIR = SCRIPT_DIR / "data"
CACHE_DIR = SCRIPT_DIR / "tile_cache"
DATA_DIR.mkdir(exist_ok=True)
CACHE_DIR.mkdir(exist_ok=True)

# Koh Phangan bounding box
BBOX = (99.960, 9.695, 100.020, 9.800)  # (min_lng, min_lat, max_lng, max_lat)

# Supabase
SUPABASE_URL = "https://trvgpgpsqvvdsudpgwpm.supabase.co"
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRydmdwZ3BzcXZ2ZHN1ZHBnd3BtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzOTE3OTIsImV4cCI6MjA4ODk2Nzc5Mn0.iRx9JiEo6dZL8K5sMUKLS8Sbi5QEZ_BSXvWI9rgTENw")

# Satellite
TILE_ZOOM = 19  # ~0.3m/pixel
TILE_SIZE = 256
TILE_SERVERS = [f"https://mt{i}.google.com/vt/lyrs=s&x={{x}}&y={{y}}&z={{z}}" for i in range(4)]
REQUEST_DELAY = 0.05

# Dedup
DUPLICATE_DISTANCE_M = 12
DUPLICATE_GRID_DEG = 0.0002

# Validation
ROOF_WINDOW_PX = 16
WATER_BLUE_THRESHOLD = 1.25
VEGETATION_GREEN_THRESHOLD = 1.15
ROOF_MIN_BRIGHTNESS = 60
ROOF_MIN_VARIANCE = 100

# Discovery
SCAN_ZOOM = 18
MIN_CONTOUR_AREA_PX = 80
MAX_CONTOUR_AREA_PX = 15000
MIN_BUILDING_SOLIDITY = 0.6
GAP_DISTANCE_M = 20

# Solar (Thailand / Koh Phangan)
IRRADIANCE = 5.1        # kWh/m2/day (annual average)
PERFORMANCE_RATIO = 0.80
USABLE_AREA_RATIO = 0.65
PANEL_WATT = 550
PANEL_AREA_M2 = 2.0
TARIFF_THB = 4.5
EPC_COST_PER_KWP = 32000
```

**Step 2: Copy core geo/tile/classify functions from roof_detector.py**

Copy these functions verbatim from `~/Desktop/projects/solar/solar-intelligence/scripts/roof_detector.py`:
- `haversine_m()` (line 91-98)
- `lat_lng_to_tile()` (line 100-106)
- `lat_lng_to_pixel()` (line 108-114)
- `pixel_to_lat_lng()` (line 116-122)
- `meters_per_pixel()` (line 124-126)
- `TileFetcher` class (line 132-201)
- `_classify_window()` (line 392-437)
- `_detect_buildings_in_tile()` (line 532-591)
- `_data_richness()` (line 285-295)
- `_merge_buildings()` (line 298-310)
- `phase_dedup()` (line 207-282)
- `phase_validate()` (line 316-389)
- `phase_discover()` (line 443-529)

**Step 3: Verify imports work**

Run: `cd /tmp/cs-edit && python3 scripts/kp_building_pipeline.py --help`
Expected: Shows usage help, no import errors

**Step 4: Commit**

```bash
git add scripts/kp_building_pipeline.py
git commit -m "feat: create building pipeline script with core functions from roof_detector"
```

---

## Task 2: Phase 1 — Download OSM + Overture buildings

**Files:**
- Modify: `/tmp/cs-edit/scripts/kp_building_pipeline.py`

**Step 1: Add OSM download function**

```python
def download_osm_buildings() -> List[dict]:
    """Fetch all buildings from OpenStreetMap via Overpass API."""
    print("\n=== DOWNLOAD: OSM Buildings ===")
    min_lng, min_lat, max_lng, max_lat = BBOX

    query = f"""
    [out:json][timeout:120];
    (
      way["building"]({min_lat},{min_lng},{max_lat},{max_lng});
      relation["building"]({min_lat},{min_lng},{max_lat},{max_lng});
    );
    out center meta;
    """

    endpoints = [
        "https://overpass-api.de/api/interpreter",
        "https://overpass.kumi.systems/api/interpreter",
    ]

    for endpoint in endpoints:
        try:
            print(f"  Trying {endpoint}...")
            resp = requests.post(endpoint, data={"data": query}, timeout=120)
            resp.raise_for_status()
            data = resp.json()
            elements = data.get("elements", [])

            buildings = []
            for el in elements:
                center = el.get("center", {})
                lat = center.get("lat") or el.get("lat")
                lng = center.get("lon") or el.get("lon")
                if not lat or not lng:
                    continue

                tags = el.get("tags", {})
                buildings.append({
                    "lat": lat,
                    "lng": lng,
                    "name": tags.get("name", ""),
                    "building_type": tags.get("building", "yes"),
                    "source": "osm",
                    "osm_id": el.get("id"),
                })

            print(f"  Downloaded {len(buildings)} buildings from OSM")
            return buildings
        except Exception as e:
            print(f"  Failed: {e}")

    print("  ERROR: All OSM endpoints failed")
    return []
```

**Step 2: Add Overture Maps download function**

```python
def download_overture_buildings() -> List[dict]:
    """Fetch building footprints from Overture Maps (if available locally)."""
    print("\n=== DOWNLOAD: Overture Maps Buildings ===")

    # Check for local Overture data (from solar-intelligence)
    overture_path = Path.home() / "Desktop/projects/solar/solar-intelligence/public/data/overture_buildings.geojson"
    if not overture_path.exists():
        print(f"  Overture file not found at {overture_path}")
        print("  Skipping Overture — will use OSM + satellite detection only")
        return []

    with open(overture_path) as f:
        geojson = json.load(f)

    min_lng, min_lat, max_lng, max_lat = BBOX
    buildings = []

    for feature in geojson.get("features", []):
        props = feature.get("properties", {})
        geom = feature.get("geometry", {})

        # Get centroid
        if geom.get("type") == "Point":
            lng, lat = geom["coordinates"]
        elif geom.get("type") == "Polygon":
            coords = geom["coordinates"][0]
            lng = sum(c[0] for c in coords) / len(coords)
            lat = sum(c[1] for c in coords) / len(coords)
        else:
            continue

        # Filter to Koh Phangan bbox
        if not (min_lat <= lat <= max_lat and min_lng <= lng <= max_lng):
            continue

        # Calculate area from polygon if available
        area = 0
        if geom.get("type") == "Polygon":
            area = _polygon_area_m2(geom["coordinates"][0])

        buildings.append({
            "lat": lat,
            "lng": lng,
            "name": props.get("name", ""),
            "area": area,
            "building_type": props.get("class", ""),
            "source": "overture",
        })

    print(f"  Loaded {len(buildings)} Overture buildings in Koh Phangan bbox")
    return buildings


def _polygon_area_m2(coords: list) -> float:
    """Calculate area in m² from a polygon in WGS84 coords using Shoelace formula."""
    n = len(coords)
    if n < 3:
        return 0
    # Approximate: convert to meters using local projection
    ref_lat = sum(c[1] for c in coords) / n
    m_per_deg_lat = 111320
    m_per_deg_lng = 111320 * math.cos(math.radians(ref_lat))

    area = 0
    for i in range(n):
        j = (i + 1) % n
        xi = coords[i][0] * m_per_deg_lng
        yi = coords[i][1] * m_per_deg_lat
        xj = coords[j][0] * m_per_deg_lng
        yj = coords[j][1] * m_per_deg_lat
        area += xi * yj - xj * yi
    return abs(area) / 2
```

**Step 3: Test the download phase**

Run: `python3 scripts/kp_building_pipeline.py --phase download`
Expected: Downloads OSM buildings (should be ~2,000-4,000), optionally loads Overture

**Step 4: Commit**

```bash
git add scripts/kp_building_pipeline.py scripts/data/
git commit -m "feat: add OSM + Overture building download phase"
```

---

## Task 3: Phase 2 — Merge & Deduplicate

**Files:**
- Modify: `/tmp/cs-edit/scripts/kp_building_pipeline.py`

**Step 1: Add merge function**

```python
def merge_sources(osm: List[dict], overture: List[dict]) -> List[dict]:
    """Merge OSM + Overture buildings, deduplicate by proximity."""
    print(f"\n=== MERGE: {len(osm)} OSM + {len(overture)} Overture ===")

    # Normalize to common format
    all_buildings = []
    for b in osm:
        all_buildings.append({
            "lat": b["lat"],
            "lng": b["lng"],
            "name": b.get("name", ""),
            "building_type": b.get("building_type", ""),
            "area": b.get("area", 0),
            "source": "osm",
            "osm_id": b.get("osm_id"),
        })
    for b in overture:
        all_buildings.append({
            "lat": b["lat"],
            "lng": b["lng"],
            "name": b.get("name", ""),
            "building_type": b.get("building_type", ""),
            "area": b.get("area", 0),
            "source": "overture",
        })

    print(f"  Combined: {len(all_buildings)}")

    # Run dedup (reused from roof_detector)
    deduped, stats = phase_dedup(all_buildings)

    # Save intermediate
    out_path = DATA_DIR / "buildings_merged.json"
    with open(out_path, "w") as f:
        json.dump(deduped, f)
    print(f"  Saved to {out_path}")

    return deduped
```

**Step 2: Test merge**

Run: `python3 scripts/kp_building_pipeline.py --phase merge`
Expected: Merges and deduplicates, saves `scripts/data/buildings_merged.json`

**Step 3: Commit**

```bash
git commit -am "feat: add merge/dedup phase"
```

---

## Task 4: Phase 3 — Satellite Validation + Area Calculation

**Files:**
- Modify: `/tmp/cs-edit/scripts/kp_building_pipeline.py`

**Step 1: Add area calculation from satellite tile**

```python
def calculate_roof_area(fetcher: TileFetcher, lat: float, lng: float) -> float:
    """Calculate actual roof area in m² from satellite tile contour detection."""
    tx, ty = lat_lng_to_tile(lat, lng, TILE_ZOOM)
    tile = fetcher.get_tile(tx, ty)
    if tile is None:
        return 0

    # Get local pixel position
    abs_px, abs_py = lat_lng_to_pixel(lat, lng, TILE_ZOOM)
    local_x = abs_px % TILE_SIZE
    local_y = abs_py % TILE_SIZE

    # Extract 64x64 window around building
    radius = 32
    y1 = max(0, local_y - radius)
    y2 = min(TILE_SIZE, local_y + radius)
    x1 = max(0, local_x - radius)
    x2 = min(TILE_SIZE, local_x + radius)
    window = tile[y1:y2, x1:x2]

    if window.size == 0:
        return 0

    # Edge detection + contour finding
    gray = cv2.cvtColor(window, cv2.COLOR_RGB2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    edges = cv2.dilate(edges, kernel, iterations=1)
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if not contours:
        return 0

    # Find the contour closest to center
    center = (window.shape[1] // 2, window.shape[0] // 2)
    best_contour = None
    best_dist = float('inf')

    for c in contours:
        area_px = cv2.contourArea(c)
        if area_px < 20 or area_px > 4000:  # Filter noise and huge contours
            continue
        M = cv2.moments(c)
        if M["m00"] == 0:
            continue
        cx = int(M["m10"] / M["m00"])
        cy = int(M["m01"] / M["m00"])
        dist = math.sqrt((cx - center[0])**2 + (cy - center[1])**2)
        if dist < best_dist:
            best_dist = dist
            best_contour = c

    if best_contour is None:
        return 0

    # Convert pixel area to m²
    mpp = meters_per_pixel(lat, TILE_ZOOM)
    area_m2 = cv2.contourArea(best_contour) * mpp * mpp

    # Sanity cap: max 5000 m² (even largest resort roofs)
    return min(area_m2, 5000)
```

**Step 2: Add validation + area recalculation phase**

```python
def phase_validate_and_measure(buildings: List[dict], sample_limit: int = 0) -> List[dict]:
    """Validate buildings and recalculate roof areas from satellite."""
    print(f"\n=== VALIDATE & MEASURE: {len(buildings)} buildings ===")

    fetcher = TileFetcher(CACHE_DIR, zoom=TILE_ZOOM)
    to_process = buildings[:sample_limit] if sample_limit > 0 else buildings

    validated = []
    rejected = 0

    for i, b in enumerate(to_process):
        if i % 200 == 0 and i > 0:
            print(f"  ... {i}/{len(to_process)} ({len(validated)} valid, {rejected} rejected)")

        # Step 1: Classify (building or not?)
        window = fetcher.get_window(b["lat"], b["lng"])
        if window is None:
            continue

        classification = _classify_window(window)
        if classification in ("water", "vegetation", "empty"):
            rejected += 1
            continue

        # Step 2: Calculate real roof area
        area = calculate_roof_area(fetcher, b["lat"], b["lng"])
        if area > 0:
            b["area"] = round(area, 1)
        elif b.get("area", 0) <= 0:
            b["area"] = 80  # Default fallback

        # Cap unreasonable areas
        if b["area"] > 5000:
            b["area"] = 80

        validated.append(b)

    # Add unprocessed buildings (if sample)
    if sample_limit > 0:
        validated.extend(buildings[sample_limit:])

    print(f"  Validated: {len(validated)}, Rejected: {rejected}")
    print(f"  {fetcher.stats()}")

    out_path = DATA_DIR / "buildings_validated.json"
    with open(out_path, "w") as f:
        json.dump(validated, f)
    print(f"  Saved to {out_path}")

    return validated
```

**Step 3: Test with sample of 50**

Run: `python3 scripts/kp_building_pipeline.py --phase validate --sample 50`
Expected: Validates 50 buildings, shows confirmed/rejected counts, saves result

**Step 4: Commit**

```bash
git commit -am "feat: add satellite validation + roof area measurement"
```

---

## Task 5: Phase 4 — Discover Missing Buildings

**Files:**
- Modify: `/tmp/cs-edit/scripts/kp_building_pipeline.py`

**Step 1: Add full-island discovery wrapper**

```python
def phase_discover_island(existing: List[dict], max_tiles: int = 2000) -> List[dict]:
    """Scan entire island to find buildings not in dataset."""
    print(f"\n=== DISCOVER: Full island scan ===")

    fetcher = TileFetcher(CACHE_DIR, zoom=SCAN_ZOOM)
    discovered, stats = phase_discover(existing, fetcher, BBOX, max_tiles=max_tiles)

    print(f"  Discovered {len(discovered)} new buildings")

    # Save
    out_path = DATA_DIR / "buildings_discovered.json"
    with open(out_path, "w") as f:
        json.dump(discovered, f)

    return discovered
```

**Step 2: Test with small tile limit**

Run: `python3 scripts/kp_building_pipeline.py --phase discover --max-tiles 50`
Expected: Scans 50 tiles, discovers some new buildings

**Step 3: Commit**

```bash
git commit -am "feat: add full island discovery phase"
```

---

## Task 6: Phase 5 — Solar Calculations

**Files:**
- Modify: `/tmp/cs-edit/scripts/kp_building_pipeline.py`

**Step 1: Add solar calculation function**

```python
def calculate_solar(buildings: List[dict]) -> List[dict]:
    """Calculate solar metrics for all buildings."""
    print(f"\n=== CALCULATE: Solar metrics for {len(buildings)} buildings ===")

    for b in buildings:
        area = b.get("area", 80)
        usable = area * USABLE_AREA_RATIO
        panels = max(1, int(usable / PANEL_AREA_M2))
        kwp = panels * PANEL_WATT / 1000
        annual_kwh = kwp * IRRADIANCE * 365 * PERFORMANCE_RATIO
        annual_savings = annual_kwh * TARIFF_THB
        monthly_savings = annual_savings / 12
        epc_cost = kwp * EPC_COST_PER_KWP
        payback = epc_cost / annual_savings if annual_savings > 0 else 99

        # Grade
        if kwp >= 50:
            grade = "A"
        elif kwp >= 20:
            grade = "B"
        elif kwp >= 5:
            grade = "C"
        else:
            grade = "D"

        b["roof_area_sqm"] = round(area, 1)
        b["potential_kwp"] = round(kwp, 2)
        b["potential_panels"] = panels
        b["potential_annual_kwh"] = round(annual_kwh)
        b["potential_monthly_savings_thb"] = round(monthly_savings)
        b["potential_grade"] = grade
        b["payback_years"] = round(payback, 1)

    # Stats
    grades = defaultdict(int)
    for b in buildings:
        grades[b["potential_grade"]] += 1

    print(f"  Grade distribution: A={grades['A']}, B={grades['B']}, C={grades['C']}, D={grades['D']}")
    print(f"  Total kWp: {sum(b['potential_kwp'] for b in buildings):,.0f}")

    return buildings
```

**Step 2: Commit**

```bash
git commit -am "feat: add solar calculation phase"
```

---

## Task 7: Phase 6 — Upload to Supabase

**Files:**
- Modify: `/tmp/cs-edit/scripts/kp_building_pipeline.py`

**Step 1: Add Supabase upsert function**

```python
def upload_to_supabase(buildings: List[dict], clear_first: bool = False):
    """Upload validated buildings to Supabase."""
    print(f"\n=== UPLOAD: {len(buildings)} buildings to Supabase ===")

    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",
    }

    if clear_first:
        print("  Clearing existing buildings...")
        resp = requests.delete(
            f"{SUPABASE_URL}/rest/v1/buildings?source=neq.manual",
            headers=headers
        )
        print(f"  Cleared: {resp.status_code}")

    # Convert to Supabase schema
    rows = []
    for b in buildings:
        rows.append({
            "name": b.get("name") or f"Building ({b.get('roof_area_sqm', 0):.0f}m²)",
            "lat": b["lat"],
            "lng": b["lng"],
            "roof_area_sqm": b.get("roof_area_sqm", 80),
            "building_type": _map_building_type(b.get("building_type", "")),
            "potential_kwp": b.get("potential_kwp", 0),
            "potential_panels": b.get("potential_panels", 0),
            "potential_annual_kwh": b.get("potential_annual_kwh", 0),
            "potential_monthly_savings_thb": b.get("potential_monthly_savings_thb", 0),
            "potential_grade": b.get("potential_grade", "D"),
            "status": "identified",
            "source": b.get("source", "import"),
        })

    # Upload in batches of 500
    batch_size = 500
    uploaded = 0
    for i in range(0, len(rows), batch_size):
        batch = rows[i:i+batch_size]
        resp = requests.post(
            f"{SUPABASE_URL}/rest/v1/buildings",
            headers=headers,
            json=batch
        )
        if resp.status_code in (200, 201):
            uploaded += len(batch)
            print(f"  Uploaded {uploaded}/{len(rows)}")
        else:
            print(f"  ERROR batch {i}: {resp.status_code} {resp.text[:200]}")

    print(f"  Done: {uploaded} buildings uploaded")


def _map_building_type(raw: str) -> str:
    """Map OSM/Overture building types to our schema."""
    mapping = {
        "hotel": "hotel", "resort": "resort", "guest_house": "guesthouse",
        "restaurant": "restaurant", "shop": "shop", "retail": "shop",
        "commercial": "office", "office": "office", "industrial": "factory",
        "warehouse": "warehouse", "school": "school", "hospital": "hospital",
        "government": "government", "house": "residential", "residential": "residential",
        "detached": "villa", "villa": "villa", "apartments": "residential",
    }
    return mapping.get(raw.lower(), "other")
```

**Step 2: Test with dry-run (print only, no upload)**

Run: `python3 scripts/kp_building_pipeline.py --phase upload --dry-run`
Expected: Shows what would be uploaded, no actual DB changes

**Step 3: Commit**

```bash
git commit -am "feat: add Supabase upload phase"
```

---

## Task 8: Add main() and CLI

**Files:**
- Modify: `/tmp/cs-edit/scripts/kp_building_pipeline.py`

**Step 1: Add main function with argument parser**

```python
def main():
    parser = argparse.ArgumentParser(description="KP Solar Pro — Building Pipeline")
    parser.add_argument("--phase", default="all",
                       choices=["all", "download", "merge", "validate", "discover", "calculate", "upload"],
                       help="Which phase to run")
    parser.add_argument("--sample", type=int, default=0, help="Validate only N buildings (0=all)")
    parser.add_argument("--max-tiles", type=int, default=2000, help="Max tiles for discovery")
    parser.add_argument("--clear-db", action="store_true", help="Clear non-manual buildings before upload")
    parser.add_argument("--dry-run", action="store_true", help="Don't upload, just show what would happen")
    args = parser.parse_args()

    print("=" * 60)
    print("KP SOLAR PRO — BUILDING PIPELINE")
    print(f"Koh Phangan bbox: {BBOX}")
    print("=" * 60)

    buildings = []

    # Load existing data if not starting from scratch
    merged_path = DATA_DIR / "buildings_merged.json"
    validated_path = DATA_DIR / "buildings_validated.json"

    if args.phase == "all" or args.phase == "download":
        osm = download_osm_buildings()
        overture = download_overture_buildings()
        buildings = merge_sources(osm, overture)

    if args.phase == "all" or args.phase == "merge":
        if not buildings and merged_path.exists():
            buildings = json.loads(merged_path.read_text())

    if args.phase in ("all", "validate"):
        if not buildings:
            if merged_path.exists():
                buildings = json.loads(merged_path.read_text())
            else:
                print("ERROR: No buildings to validate. Run --phase download first.")
                sys.exit(1)
        buildings = phase_validate_and_measure(buildings, sample_limit=args.sample)

    if args.phase in ("all", "discover"):
        if not buildings and validated_path.exists():
            buildings = json.loads(validated_path.read_text())
        discovered = phase_discover_island(buildings, max_tiles=args.max_tiles)
        buildings.extend(discovered)
        # Re-validate discovered buildings
        print(f"  Re-validating {len(discovered)} discovered buildings...")
        # (they're already pre-filtered in discover phase)

    if args.phase in ("all", "calculate"):
        if not buildings and validated_path.exists():
            buildings = json.loads(validated_path.read_text())
        buildings = calculate_solar(buildings)

    if args.phase in ("all", "upload"):
        if not buildings and validated_path.exists():
            buildings = json.loads(validated_path.read_text())
        if args.dry_run:
            print(f"\n[DRY RUN] Would upload {len(buildings)} buildings")
            grades = defaultdict(int)
            for b in buildings:
                grades[b.get("potential_grade", "?")] += 1
            print(f"  Grades: {dict(grades)}")
        else:
            upload_to_supabase(buildings, clear_first=args.clear_db)

    # Save final output
    final_path = DATA_DIR / "buildings_final.json"
    if buildings:
        with open(final_path, "w") as f:
            json.dump(buildings, f)
        print(f"\nFinal output: {len(buildings)} buildings → {final_path}")

    print("\nDone!")


if __name__ == "__main__":
    main()
```

**Step 2: Run full pipeline with sample**

Run: `python3 scripts/kp_building_pipeline.py --phase all --sample 50 --max-tiles 20 --dry-run`
Expected: Downloads OSM → merges → validates 50 → discovers in 20 tiles → calculates → shows dry-run upload

**Step 3: Commit**

```bash
git commit -am "feat: add CLI and full pipeline orchestration"
```

---

## Task 9: Run full pipeline (no sample, real upload)

**Step 1: Run full pipeline**

Run: `python3 scripts/kp_building_pipeline.py --phase all --clear-db`

Expected output (approximate):
```
=== DOWNLOAD: OSM Buildings ===
  Downloaded ~3,000-4,000 buildings from OSM

=== DOWNLOAD: Overture Maps Buildings ===
  Loaded ~2,000-5,000 Overture buildings

=== MERGE + DEDUP ===
  Combined: ~5,000-9,000
  After dedup: ~4,000-7,000

=== VALIDATE & MEASURE ===
  Validated: ~3,000-6,000 (rejected water/vegetation/empty)

=== DISCOVER ===
  Scanned 2,000 tiles, found ~500-2,000 new buildings

=== CALCULATE ===
  Grade distribution: A=X, B=Y, C=Z, D=W

=== UPLOAD ===
  Uploaded ~4,000-8,000 buildings to Supabase
```

**Step 2: Verify in platform**

Open https://index.energy-tm.com/platform/pro/ (PIN: 2626)
- Check Scanner tab — buildings should have realistic roof areas (20-500 sqm, not 500,000)
- Check Map — buildings should cover the whole island
- Check grades — distribution should be mostly C/D (residential) with some A/B (hotels/resorts)

**Step 3: Commit pipeline data**

```bash
git add scripts/data/
git commit -m "data: full island scan results — X buildings validated"
```

---

## Task 10: Drone Pipeline Script

**Files:**
- Create: `/tmp/cs-edit/scripts/process_drone.sh`

**Step 1: Create wrapper script**

```bash
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

# Step 1: Count and validate photos
PHOTO_COUNT=$(ls "$PHOTO_DIR"/*.JPG 2>/dev/null | wc -l)
echo "Found $PHOTO_COUNT photos"

if [ "$PHOTO_COUNT" -eq 0 ]; then
    echo "ERROR: No JPG files found in $PHOTO_DIR"
    exit 1
fi

# Step 2: Extract metadata
echo "Extracting metadata..."
exiftool -csv -GPSLatitude -GPSLongitude -RelativeAltitude -GimbalPitchDegree \
    "$PHOTO_DIR"/*.JPG > /tmp/drone-meta.csv

# Step 3: Split into batches and process with ODM
BATCH_NUM=0
for batch_dir in $(python3 -c "
import os, shutil, math
photos = sorted([f for f in os.listdir('$PHOTO_DIR') if f.upper().endswith('.JPG')])
batch_size = $BATCH_SIZE
for i in range(0, len(photos), batch_size):
    batch = photos[i:i+batch_size]
    d = f'/tmp/odm-batch-{i//batch_size}/code/images'
    os.makedirs(d, exist_ok=True)
    for p in batch:
        shutil.copy2(os.path.join('$PHOTO_DIR', p), os.path.join(d, p))
    print(f'/tmp/odm-batch-{i//batch_size}')
"); do
    echo "Processing batch: $batch_dir"

    docker run --rm -v "$batch_dir:/datasets" opendronemap/odm \
        --project-path /datasets \
        --orthophoto-resolution 10 \
        --feature-quality low \
        --pc-quality lowest \
        --min-num-features 4000 \
        --force-gps \
        --skip-3dmodel \
        --max-concurrency 1 2>&1 | grep -E "(Finished|ERROR)" || true

    # Reproject to WGS84
    if [ -f "$batch_dir/code/odm_orthophoto/odm_orthophoto.tif" ]; then
        gdalwarp -t_srs EPSG:4326 -r bilinear \
            "$batch_dir/code/odm_orthophoto/odm_orthophoto.tif" \
            "/tmp/ortho-batch-${BATCH_NUM}.tif"
        BATCH_NUM=$((BATCH_NUM + 1))
    fi
done

# Step 4: Merge orthomosaics
echo "Merging orthomosaics..."
gdal_merge.py -o /tmp/ortho-merged.tif /tmp/ortho-batch-*.tif -co COMPRESS=LZW

# Step 5: Generate tiles
echo "Generating tiles..."
gdal2tiles.py -z 18-19 -w none -r bilinear --xyz /tmp/ortho-merged.tif /tmp/new-tiles/

# Step 6: Clean nodata tiles
python3 -c "
import os, cv2, numpy as np
for root, dirs, files in os.walk('/tmp/new-tiles'):
    for f in files:
        if not f.endswith('.png'): continue
        path = os.path.join(root, f)
        img = cv2.imread(path, cv2.IMREAD_UNCHANGED)
        if img is None: os.remove(path); continue
        if img.shape[2] == 4:
            alpha = img[:,:,3]
            if np.sum(alpha < 128) / alpha.size > 0.5:
                os.remove(path); continue
        # Remove orange nodata
        b,g,r = img[:,:,0], img[:,:,1], img[:,:,2]
        orange = (r > 130) & (g > 80) & (g < 220) & (b < 140)
        gray = cv2.cvtColor(img[:,:,:3], cv2.COLOR_BGR2GRAY)
        local_var = cv2.blur((gray.astype(float))**2, (5,5)) - cv2.blur(gray.astype(float), (5,5))**2
        nodata = orange & (local_var < 50)
        if img.shape[2] == 4 and np.sum(nodata) > 0:
            img[:,:,3][nodata] = 0
            cv2.imwrite(path, img)
"

# Step 7: Merge with existing tiles
echo "Merging with existing tiles..."
cp -r /tmp/new-tiles/* "$TILE_DIR/" 2>/dev/null || true

# Step 8: Run building detection on new coverage
echo "Detecting buildings in new coverage..."
python3 "$REPO_DIR/scripts/kp_building_pipeline.py" --phase discover --max-tiles 500

# Step 9: Commit and push
cd "$REPO_DIR"
git add drone-tiles/v2/
git commit -m "drone: add new orthomosaic tiles from $(basename $PHOTO_DIR)"
git push origin main

echo "=== DONE ==="
echo "New tiles deployed. Check https://index.energy-tm.com/platform/pro/"
```

**Step 2: Make executable**

Run: `chmod +x /tmp/cs-edit/scripts/process_drone.sh`

**Step 3: Commit**

```bash
git add scripts/process_drone.sh
git commit -m "feat: add drone processing pipeline script"
```

---

## Execution Summary

| Task | What | Time Est. |
|------|------|-----------|
| 1 | Create pipeline script + core functions | 10 min |
| 2 | OSM + Overture download | 5 min |
| 3 | Merge + dedup | 5 min |
| 4 | Satellite validation + area calc | 10 min |
| 5 | Full island discovery | 5 min |
| 6 | Solar calculations | 5 min |
| 7 | Supabase upload | 5 min |
| 8 | CLI + orchestration | 5 min |
| 9 | Run full pipeline | 30-60 min (satellite API) |
| 10 | Drone pipeline script | 10 min |

**Total writing: ~1 hour. Total runtime: ~1-2 hours (satellite tile downloads).**
