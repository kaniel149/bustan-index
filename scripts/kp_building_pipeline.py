#!/usr/bin/env python3
"""
kp_building_pipeline.py — KP Solar Pro Building Detection Pipeline

6-Phase pipeline for Koh Phangan solar prospecting:
  1. DOWNLOAD  — Fetch buildings from OSM + Overture Maps
  2. MERGE     — Deduplicate and combine sources
  3. VALIDATE  — Confirm each building against Google satellite imagery
  4. DISCOVER  — Find missing buildings via satellite tile scan
  5. CALCULATE — Compute solar metrics (kWp, savings, payback)
  6. UPLOAD    — Push to Supabase buildings table

Usage:
  python scripts/kp_building_pipeline.py --phase all
  python scripts/kp_building_pipeline.py --phase download
  python scripts/kp_building_pipeline.py --phase validate --sample 500
  python scripts/kp_building_pipeline.py --phase upload --dry-run
  python scripts/kp_building_pipeline.py --phase discover --max-tiles 3000
"""

import argparse
import json
import math
import os
import sys
import time
from collections import defaultdict
from io import BytesIO
from pathlib import Path
from typing import List, Dict, Tuple, Optional, Set

import cv2
import numpy as np
import requests
from PIL import Image

# ═══════════════════════════════════════════════════════
# Configuration
# ═══════════════════════════════════════════════════════

# Koh Phangan bounding box: [min_lng, min_lat, max_lng, max_lat]
BBOX = (99.93, 9.68, 100.07, 9.81)

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://trvgpgpsqvvdsudpgwpm.supabase.co")
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRydmdwZ3BzcXZ2ZHN1ZHBnd3BtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzOTE3OTIsImV4cCI6MjA4ODk2Nzc5Mn0.iRx9JiEo6dZL8K5sMUKLS8Sbi5QEZ_BSXvWI9rgTENw")

SCRIPTS_DIR = Path(__file__).resolve().parent
DATA_DIR = SCRIPTS_DIR / "data"
CACHE_DIR = SCRIPTS_DIR / "tile_cache"

DATA_DIR.mkdir(parents=True, exist_ok=True)
CACHE_DIR.mkdir(parents=True, exist_ok=True)

# Satellite tiles
TILE_ZOOM = 19                  # Google satellite zoom (19 = ~0.3m/pixel)
TILE_SIZE = 256
TILE_SERVERS = [
    "https://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
    "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
    "https://mt2.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
    "https://mt3.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
]
REQUEST_DELAY = 0.05            # Rate limit (seconds between requests)
MAX_CONCURRENT_TILES = 500      # Max tiles to fetch per run

# Deduplication
DUPLICATE_DISTANCE_M = 12       # Buildings closer than this = duplicate
DUPLICATE_GRID_DEG = 0.0002     # ~22m grid cells for spatial indexing

# Validation thresholds
ROOF_WINDOW_PX = 16             # Check 16x16 pixel window around building center
WATER_BLUE_THRESHOLD = 1.25     # Blue channel > 1.25x mean(R,G) = water
VEGETATION_GREEN_THRESHOLD = 1.15
ROOF_MIN_BRIGHTNESS = 60        # Minimum average brightness for roof
ROOF_MIN_VARIANCE = 100         # Minimum color variance (flat color = road/water)
ROOF_MAX_VARIANCE = 8000        # Maximum variance (too noisy = vegetation/forest)

# Gap detection
SCAN_ZOOM = 18                  # Zoom for gap scanning (slightly lower for coverage)
EDGE_THRESHOLD_LOW = 50
EDGE_THRESHOLD_HIGH = 150
MIN_CONTOUR_AREA_PX = 80        # Min building area in pixels at zoom 18
MAX_CONTOUR_AREA_PX = 15000     # Max building area in pixels
MIN_BUILDING_SOLIDITY = 0.6     # Rectangularity of detected shapes
GAP_DISTANCE_M = 20             # Flag if no existing building within this distance

# Solar constants (Thailand / Koh Phangan)
IRRADIANCE = 4.8                # kWh/m²/day
PERFORMANCE_RATIO = 0.80
USABLE_AREA_RATIO = 0.65
PANEL_WATT = 550
PANEL_AREA_M2 = 2.0
TARIFF_THB = 4.5
EPC_COST_PER_KWP = 32000        # THB per kWp installed

# ═══════════════════════════════════════════════════════
# Geo math
# ═══════════════════════════════════════════════════════

def haversine_m(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Distance in meters between two coordinates."""
    R = 6371000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

def lat_lng_to_tile(lat: float, lng: float, zoom: int) -> Tuple[int, int]:
    """Convert lat/lng to tile x,y at given zoom."""
    n = 2 ** zoom
    x = int((lng + 180) / 360 * n)
    lat_rad = math.radians(lat)
    y = int((1 - math.log(math.tan(lat_rad) + 1 / math.cos(lat_rad)) / math.pi) / 2 * n)
    return x, y

def lat_lng_to_pixel(lat: float, lng: float, zoom: int) -> Tuple[int, int]:
    """Convert lat/lng to absolute pixel coordinates at given zoom."""
    n = 2 ** zoom
    px = int((lng + 180) / 360 * n * TILE_SIZE)
    lat_rad = math.radians(lat)
    py = int((1 - math.log(math.tan(lat_rad) + 1 / math.cos(lat_rad)) / math.pi) / 2 * n * TILE_SIZE)
    return px, py

def pixel_to_lat_lng(px: int, py: int, zoom: int) -> Tuple[float, float]:
    """Convert absolute pixel coordinates back to lat/lng."""
    n = 2 ** zoom
    lng = px / (n * TILE_SIZE) * 360 - 180
    lat_rad = math.atan(math.sinh(math.pi * (1 - 2 * py / (n * TILE_SIZE))))
    lat = math.degrees(lat_rad)
    return lat, lng

def meters_per_pixel(lat: float, zoom: int) -> float:
    """Approximate meters per pixel at given latitude and zoom."""
    return 156543.03 * math.cos(math.radians(lat)) / (2 ** zoom)

# ═══════════════════════════════════════════════════════
# Tile fetcher with cache
# ═══════════════════════════════════════════════════════

class TileFetcher:
    def __init__(self, cache_dir: Path, zoom: int = TILE_ZOOM):
        self.cache_dir = cache_dir / str(zoom)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.zoom = zoom
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "SolarIntelligence/1.0 (roof detection pipeline)"
        })
        self.request_count = 0
        self.cache_hits = 0

    def get_tile(self, tx: int, ty: int) -> Optional[np.ndarray]:
        """Fetch a tile as numpy array (RGB). Returns None on failure."""
        cache_path = self.cache_dir / f"{tx}_{ty}.jpg"

        if cache_path.exists():
            self.cache_hits += 1
            img = cv2.imread(str(cache_path))
            return cv2.cvtColor(img, cv2.COLOR_BGR2RGB) if img is not None else None

        server = TILE_SERVERS[self.request_count % len(TILE_SERVERS)]
        url = server.format(x=tx, y=ty, z=self.zoom)

        try:
            resp = self.session.get(url, timeout=10)
            resp.raise_for_status()
            arr = np.frombuffer(resp.content, np.uint8)
            img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
            if img is None:
                return None
            # Cache as JPEG (smaller than PNG)
            cv2.imwrite(str(cache_path), img)
            self.request_count += 1
            if self.request_count % 50 == 0:
                time.sleep(REQUEST_DELAY * 5)  # Brief pause every 50 requests
            else:
                time.sleep(REQUEST_DELAY)
            return cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        except Exception as e:
            print(f"  Tile fetch failed ({tx},{ty}): {e}")
            return None

    def get_window(self, lat: float, lng: float, radius_px: int = ROOF_WINDOW_PX) -> Optional[np.ndarray]:
        """Extract a pixel window around a lat/lng from satellite tiles."""
        tx, ty = lat_lng_to_tile(lat, lng, self.zoom)
        tile = self.get_tile(tx, ty)
        if tile is None:
            return None

        # Pixel position within this tile
        abs_px, abs_py = lat_lng_to_pixel(lat, lng, self.zoom)
        local_x = abs_px % TILE_SIZE
        local_y = abs_py % TILE_SIZE

        # Extract window (handle edge cases by padding)
        h, w = tile.shape[:2]
        x1 = max(0, local_x - radius_px)
        y1 = max(0, local_y - radius_px)
        x2 = min(w, local_x + radius_px)
        y2 = min(h, local_y + radius_px)

        window = tile[y1:y2, x1:x2]
        if window.size == 0:
            return None
        return window

    def stats(self) -> str:
        total = self.request_count + self.cache_hits
        return f"Tiles: {total} total ({self.cache_hits} cached, {self.request_count} fetched)"

# ═══════════════════════════════════════════════════════
# Phase 1: DEDUPLICATION
# ═══════════════════════════════════════════════════════

def phase_dedup(buildings: List[dict]) -> Tuple[List[dict], dict]:
    """Remove duplicate buildings using spatial proximity."""
    print("\n=== PHASE 1: DEDUPLICATION ===")
    print(f"  Input: {len(buildings)} buildings")

    # Step 1: Remove exact coordinate duplicates
    seen_coords: Dict[str, int] = {}
    unique = []
    exact_dupes = 0
    for b in buildings:
        key = f"{b['lat']:.6f},{b['lng']:.6f}"
        if key in seen_coords:
            exact_dupes += 1
            # Keep the one with more data
            existing = unique[seen_coords[key]]
            if _data_richness(b) > _data_richness(existing):
                unique[seen_coords[key]] = b
        else:
            seen_coords[key] = len(unique)
            unique.append(b)
    print(f"  Exact coordinate duplicates removed: {exact_dupes}")

    # Step 2: Spatial grid indexing for proximity check
    grid: Dict[str, List[int]] = defaultdict(list)
    for i, b in enumerate(unique):
        gx = int(b['lng'] / DUPLICATE_GRID_DEG)
        gy = int(b['lat'] / DUPLICATE_GRID_DEG)
        grid[f"{gx},{gy}"].append(i)

    # Step 3: Find and merge nearby buildings
    merged_into: Dict[int, int] = {}  # idx → merged_into_idx
    proximity_dupes = 0

    for cell_key, indices in grid.items():
        gx, gy = map(int, cell_key.split(','))
        # Check this cell + 8 neighbors
        neighbors = []
        for dx in [-1, 0, 1]:
            for dy in [-1, 0, 1]:
                nkey = f"{gx+dx},{gy+dy}"
                if nkey in grid:
                    neighbors.extend(grid[nkey])

        # Pairwise distance check within neighborhood
        for i, idx_a in enumerate(indices):
            if idx_a in merged_into:
                continue
            for idx_b in neighbors:
                if idx_b <= idx_a or idx_b in merged_into:
                    continue
                dist = haversine_m(
                    unique[idx_a]['lat'], unique[idx_a]['lng'],
                    unique[idx_b]['lat'], unique[idx_b]['lng']
                )
                if dist < DUPLICATE_DISTANCE_M:
                    # Merge: keep the one with more data
                    if _data_richness(unique[idx_b]) > _data_richness(unique[idx_a]):
                        merged_into[idx_a] = idx_b
                        unique[idx_b] = _merge_buildings(unique[idx_b], unique[idx_a])
                    else:
                        merged_into[idx_b] = idx_a
                        unique[idx_a] = _merge_buildings(unique[idx_a], unique[idx_b])
                    proximity_dupes += 1

    deduped = [b for i, b in enumerate(unique) if i not in merged_into]
    print(f"  Proximity duplicates merged: {proximity_dupes}")
    print(f"  Output: {len(deduped)} buildings")

    stats = {
        "input": len(buildings),
        "exact_dupes": exact_dupes,
        "proximity_dupes": proximity_dupes,
        "output": len(deduped),
        "removed_pct": round((1 - len(deduped) / len(buildings)) * 100, 1),
    }
    return deduped, stats


def _data_richness(b: dict) -> int:
    """Score how much useful data a building has."""
    score = 0
    for key in ['title', 'ownerName', 'phone', 'email', 'website', 'category']:
        if b.get(key) and str(b[key]).strip():
            score += 1
    if b.get('area', 0) > 0:
        score += 1
    if b.get('solarScore', 0) > 0:
        score += 1
    return score


def _merge_buildings(primary: dict, secondary: dict) -> dict:
    """Merge secondary data into primary (primary wins on conflicts)."""
    result = {**primary}
    for key in ['title', 'ownerName', 'phone', 'email', 'website', 'category']:
        if not result.get(key) and secondary.get(key):
            result[key] = secondary[key]
    # Average coordinates for slightly better position
    result['lat'] = (primary['lat'] + secondary['lat']) / 2
    result['lng'] = (primary['lng'] + secondary['lng']) / 2
    # Keep larger area
    if secondary.get('area', 0) > result.get('area', 0):
        result['area'] = secondary['area']
    return result

# ═══════════════════════════════════════════════════════
# Phase 2: SATELLITE VALIDATION
# ═══════════════════════════════════════════════════════

def phase_validate(buildings: List[dict], fetcher: TileFetcher, sample_limit: int = 0) -> Tuple[List[dict], dict]:
    """Validate each building against satellite imagery."""
    print("\n=== PHASE 2: SATELLITE VALIDATION ===")

    total = len(buildings)
    if sample_limit > 0:
        to_validate = buildings[:sample_limit]
        print(f"  Validating sample: {sample_limit}/{total} buildings")
    else:
        to_validate = buildings
        print(f"  Validating all {total} buildings")

    confirmed = 0
    rejected_water = 0
    rejected_vegetation = 0
    rejected_empty = 0
    uncertain = 0
    fetch_failed = 0

    for i, b in enumerate(to_validate):
        if i % 500 == 0 and i > 0:
            print(f"  ... {i}/{len(to_validate)} ({confirmed} confirmed, {rejected_water+rejected_vegetation+rejected_empty} rejected)")

        window = fetcher.get_window(b['lat'], b['lng'])
        if window is None:
            fetch_failed += 1
            b['_validation'] = 'fetch_failed'
            continue

        classification = _classify_window(window)
        b['_validation'] = classification

        if classification == 'building':
            confirmed += 1
        elif classification == 'water':
            rejected_water += 1
        elif classification == 'vegetation':
            rejected_vegetation += 1
        elif classification == 'empty':
            rejected_empty += 1
        else:
            uncertain += 1

    # For unvalidated buildings (beyond sample), mark as uncertain
    if sample_limit > 0:
        for b in buildings[sample_limit:]:
            b['_validation'] = 'unvalidated'

    # Filter out rejected buildings
    validated = [b for b in buildings if b.get('_validation') not in ('water', 'vegetation', 'empty')]

    total_rejected = rejected_water + rejected_vegetation + rejected_empty
    print(f"\n  Results:")
    print(f"    Confirmed buildings: {confirmed}")
    print(f"    Rejected (water):      {rejected_water}")
    print(f"    Rejected (vegetation): {rejected_vegetation}")
    print(f"    Rejected (empty/road): {rejected_empty}")
    print(f"    Uncertain:             {uncertain}")
    print(f"    Fetch failed:          {fetch_failed}")
    print(f"  {fetcher.stats()}")
    print(f"  Output: {len(validated)} buildings (removed {total_rejected})")

    stats = {
        "validated": len(to_validate) - fetch_failed,
        "confirmed": confirmed,
        "rejected_water": rejected_water,
        "rejected_vegetation": rejected_vegetation,
        "rejected_empty": rejected_empty,
        "uncertain": uncertain,
        "fetch_failed": fetch_failed,
        "accuracy_pct": round(confirmed / max(1, confirmed + total_rejected) * 100, 1),
        "output": len(validated),
    }
    return validated, stats


def _classify_window(window: np.ndarray) -> str:
    """Classify a satellite image window as building/water/vegetation/empty."""
    if window.size == 0:
        return 'uncertain'

    # Average color channels
    mean_r = float(np.mean(window[:, :, 0]))
    mean_g = float(np.mean(window[:, :, 1]))
    mean_b = float(np.mean(window[:, :, 2]))
    brightness = (mean_r + mean_g + mean_b) / 3

    # Color variance (per-pixel)
    variance = float(np.var(window))

    # Water detection: blue dominant + low variance
    rg_mean = (mean_r + mean_g) / 2
    if rg_mean > 0 and mean_b / rg_mean > WATER_BLUE_THRESHOLD and brightness < 120:
        return 'water'

    # Dense vegetation: green dominant
    rb_mean = (mean_r + mean_b) / 2
    if rb_mean > 0 and mean_g / rb_mean > VEGETATION_GREEN_THRESHOLD and brightness < 100:
        return 'vegetation'

    # Very dark (shadow/forest) or very bright (overexposed)
    if brightness < 30:
        return 'vegetation'  # Likely dense canopy

    # Empty/road: very low variance (uniform color) + gray tones
    if variance < ROOF_MIN_VARIANCE and brightness > ROOF_MIN_BRIGHTNESS:
        # Could be road or parking lot — check for edges
        gray = cv2.cvtColor(window, cv2.COLOR_RGB2GRAY)
        edges = cv2.Canny(gray, 30, 100)
        edge_ratio = np.count_nonzero(edges) / edges.size
        if edge_ratio < 0.02:
            return 'empty'  # Very smooth = road/parking

    # Building: moderate variance, moderate brightness, has edges
    if brightness >= ROOF_MIN_BRIGHTNESS:
        gray = cv2.cvtColor(window, cv2.COLOR_RGB2GRAY)
        edges = cv2.Canny(gray, EDGE_THRESHOLD_LOW, EDGE_THRESHOLD_HIGH)
        edge_ratio = np.count_nonzero(edges) / edges.size
        if edge_ratio > 0.03 or variance > ROOF_MIN_VARIANCE:
            return 'building'

    return 'uncertain'

# ═══════════════════════════════════════════════════════
# Phase 3: DISCOVER MISSING BUILDINGS
# ═══════════════════════════════════════════════════════

def phase_discover(buildings: List[dict], fetcher: TileFetcher,
                   bbox: Tuple[float, float, float, float],
                   max_tiles: int = MAX_CONCURRENT_TILES,
                   region: str = "koh_phangan") -> Tuple[List[dict], dict]:
    """Scan satellite tiles to find buildings not in the dataset."""
    print("\n=== PHASE 3: DISCOVER MISSING BUILDINGS ===")

    min_lng, min_lat, max_lng, max_lat = bbox
    print(f"  Scanning bbox: [{min_lng:.3f},{min_lat:.3f}] -> [{max_lng:.3f},{max_lat:.3f}]")

    # Use lower zoom for scanning (covers more area per tile)
    scan_fetcher = TileFetcher(CACHE_DIR, zoom=SCAN_ZOOM)

    # Build spatial index of existing buildings
    existing_grid: Dict[str, List[dict]] = defaultdict(list)
    grid_step = 0.0003  # ~33m grid
    for b in buildings:
        gx = int(b['lng'] / grid_step)
        gy = int(b['lat'] / grid_step)
        existing_grid[f"{gx},{gy}"].append(b)

    # Calculate tiles to scan
    tx_min, ty_max = lat_lng_to_tile(min_lat, min_lng, SCAN_ZOOM)
    tx_max, ty_min = lat_lng_to_tile(max_lat, max_lng, SCAN_ZOOM)

    total_tiles = (tx_max - tx_min + 1) * (ty_max - ty_min + 1)
    print(f"  Tiles to scan: {total_tiles} (at zoom {SCAN_ZOOM})")

    if total_tiles > max_tiles:
        print(f"  Limiting to {max_tiles} tiles (use --max-tiles to increase)")
        total_tiles = max_tiles

    mpp = meters_per_pixel(min_lat, SCAN_ZOOM)
    min_area_m2 = MIN_CONTOUR_AREA_PX * mpp * mpp
    print(f"  Resolution: {mpp:.2f} m/pixel | Min building: {min_area_m2:.0f} m2")

    discovered = []
    tiles_scanned = 0

    for ty in range(ty_min, ty_max + 1):
        for tx in range(tx_min, tx_max + 1):
            if tiles_scanned >= max_tiles:
                break

            tile = scan_fetcher.get_tile(tx, ty)
            if tile is None:
                continue

            tiles_scanned += 1
            if tiles_scanned % 50 == 0:
                print(f"  ... scanned {tiles_scanned}/{min(total_tiles, max_tiles)} tiles, found {len(discovered)} candidates")

            # Detect building-like contours
            candidates = _detect_buildings_in_tile(tile, tx, ty, SCAN_ZOOM, mpp)

            for lat, lng, area_m2 in candidates:
                # Check if an existing building is nearby
                gx = int(lng / grid_step)
                gy = int(lat / grid_step)
                has_nearby = False
                for dx in [-1, 0, 1]:
                    for dy in [-1, 0, 1]:
                        for existing in existing_grid.get(f"{gx+dx},{gy+dy}", []):
                            if haversine_m(lat, lng, existing['lat'], existing['lng']) < GAP_DISTANCE_M:
                                has_nearby = True
                                break
                        if has_nearby:
                            break
                    if has_nearby:
                        break

                if not has_nearby:
                    discovered.append(_create_building(lat, lng, area_m2, region))

        if tiles_scanned >= max_tiles:
            break

    print(f"\n  Tiles scanned: {tiles_scanned}")
    print(f"  {scan_fetcher.stats()}")
    print(f"  New buildings discovered: {len(discovered)}")

    stats = {
        "tiles_scanned": tiles_scanned,
        "total_tiles": total_tiles,
        "discovered": len(discovered),
    }
    return discovered, stats


def _detect_buildings_in_tile(tile: np.ndarray, tx: int, ty: int, zoom: int, mpp: float) -> List[Tuple[float, float, float]]:
    """Detect building-like contours in a satellite tile. Returns [(lat, lng, area_m2), ...]."""
    results = []

    # Convert to grayscale
    gray = cv2.cvtColor(tile, cv2.COLOR_RGB2GRAY)

    # Adaptive threshold to handle varying brightness
    thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                    cv2.THRESH_BINARY, 21, 5)

    # Edge detection
    edges = cv2.Canny(gray, EDGE_THRESHOLD_LOW, EDGE_THRESHOLD_HIGH)

    # Dilate edges to connect nearby edges
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    edges_dilated = cv2.dilate(edges, kernel, iterations=1)

    # Find contours
    contours, _ = cv2.findContours(edges_dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    for contour in contours:
        area_px = cv2.contourArea(contour)
        if area_px < MIN_CONTOUR_AREA_PX or area_px > MAX_CONTOUR_AREA_PX:
            continue

        # Check solidity (rectangularity)
        hull = cv2.convexHull(contour)
        hull_area = cv2.contourArea(hull)
        if hull_area == 0:
            continue
        solidity = area_px / hull_area
        if solidity < MIN_BUILDING_SOLIDITY:
            continue

        # Get centroid
        M = cv2.moments(contour)
        if M["m00"] == 0:
            continue
        cx = int(M["m10"] / M["m00"])
        cy = int(M["m01"] / M["m00"])

        # Check color at centroid (reject water/vegetation)
        window = tile[max(0, cy-4):cy+4, max(0, cx-4):cx+4]
        if window.size > 0:
            classification = _classify_window(window)
            if classification in ('water', 'vegetation'):
                continue

        # Convert pixel to lat/lng
        abs_px = tx * TILE_SIZE + cx
        abs_py = ty * TILE_SIZE + cy
        lat, lng = pixel_to_lat_lng(abs_px, abs_py, zoom)

        # Convert area from pixels to m²
        area_m2 = area_px * mpp * mpp

        results.append((lat, lng, area_m2))

    return results

# ═══════════════════════════════════════════════════════
# Building creation
# ═══════════════════════════════════════════════════════

def _create_building(lat: float, lng: float, area_m2: float, region: str) -> dict:
    """Create a new building entry with solar calculations."""
    import uuid
    usable = area_m2 * USABLE_AREA_RATIO
    kwp = usable * (PANEL_WATT / PANEL_AREA_M2) / 1000
    panels = max(1, round(kwp * 1000 / PANEL_WATT))
    annual_kwh = kwp * IRRADIANCE * 365 * PERFORMANCE_RATIO

    # Priority scoring
    if kwp >= 50:
        priority = 'A'
        score = min(100, 70 + kwp / 10)
    elif kwp >= 20:
        priority = 'B'
        score = min(85, 50 + kwp / 2)
    elif kwp >= 5:
        priority = 'C'
        score = min(65, 30 + kwp)
    else:
        priority = 'D'
        score = max(10, kwp * 5)

    return {
        "id": f"roof_{uuid.uuid4().hex[:12]}",
        "type": "roof",
        "status": "private",
        "region": region,
        "title": f"Detected Building ({area_m2:.0f}m2)",
        "location": region.replace('_', ' ').title(),
        "lat": round(lat, 6),
        "lng": round(lng, 6),
        "area": round(area_m2, 1),
        "usableArea": round(usable, 1),
        "capacityKwp": round(kwp, 2),
        "panelCount": panels,
        "annualKwh": round(annual_kwh),
        "annualSavings": round(annual_kwh * TARIFF_THB),
        "epcCost": round(kwp * EPC_COST_PER_KWP),
        "solarScore": round(score),
        "priority": priority,
        "_source": "satellite_detection",
    }

# ═══════════════════════════════════════════════════════
# Download phase
# ═══════════════════════════════════════════════════════

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
                    "lat": lat, "lng": lng,
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


def download_overture_buildings() -> List[dict]:
    """Load Overture Maps buildings if available locally."""
    print("\n=== DOWNLOAD: Overture Maps Buildings ===")
    overture_path = Path.home() / "Desktop/projects/solar/solar-intelligence/public/data/overture_buildings.geojson"
    if not overture_path.exists():
        print(f"  Overture file not found, skipping")
        return []
    with open(overture_path) as f:
        geojson = json.load(f)
    min_lng, min_lat, max_lng, max_lat = BBOX
    buildings = []
    for feature in geojson.get("features", []):
        props = feature.get("properties", {})
        geom = feature.get("geometry", {})
        if geom.get("type") == "Point":
            lng, lat = geom["coordinates"]
        elif geom.get("type") == "Polygon":
            coords = geom["coordinates"][0]
            lng = sum(c[0] for c in coords) / len(coords)
            lat = sum(c[1] for c in coords) / len(coords)
        else:
            continue
        if not (min_lat <= lat <= max_lat and min_lng <= lng <= max_lng):
            continue
        area = 0
        if geom.get("type") == "Polygon":
            area = _polygon_area_m2(geom["coordinates"][0])
        buildings.append({
            "lat": lat, "lng": lng,
            "name": props.get("name", ""),
            "area": area,
            "building_type": props.get("class", ""),
            "source": "overture",
        })
    print(f"  Loaded {len(buildings)} Overture buildings")
    return buildings


def _polygon_area_m2(coords: list) -> float:
    n = len(coords)
    if n < 3: return 0
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

# ═══════════════════════════════════════════════════════
# Merge phase
# ═══════════════════════════════════════════════════════

def merge_sources(osm: List[dict], overture: List[dict]) -> List[dict]:
    print(f"\n=== MERGE: {len(osm)} OSM + {len(overture)} Overture ===")
    all_buildings = []
    for b in osm:
        all_buildings.append({"lat": b["lat"], "lng": b["lng"], "name": b.get("name", ""),
            "building_type": b.get("building_type", ""), "area": b.get("area", 0), "source": "osm"})
    for b in overture:
        all_buildings.append({"lat": b["lat"], "lng": b["lng"], "name": b.get("name", ""),
            "building_type": b.get("building_type", ""), "area": b.get("area", 0), "source": "overture"})
    print(f"  Combined: {len(all_buildings)}")
    deduped, stats = phase_dedup(all_buildings)
    out_path = DATA_DIR / "buildings_merged.json"
    with open(out_path, "w") as f:
        json.dump(deduped, f)
    print(f"  Saved to {out_path}")
    return deduped

# ═══════════════════════════════════════════════════════
# Validate & measure phase
# ═══════════════════════════════════════════════════════

def calculate_roof_area(fetcher: TileFetcher, lat: float, lng: float) -> float:
    """Calculate actual roof area in m2 from satellite tile contour detection."""
    tx, ty = lat_lng_to_tile(lat, lng, TILE_ZOOM)
    tile = fetcher.get_tile(tx, ty)
    if tile is None: return 0
    abs_px, abs_py = lat_lng_to_pixel(lat, lng, TILE_ZOOM)
    local_x = abs_px % TILE_SIZE
    local_y = abs_py % TILE_SIZE
    radius = 32
    y1, y2 = max(0, local_y - radius), min(TILE_SIZE, local_y + radius)
    x1, x2 = max(0, local_x - radius), min(TILE_SIZE, local_x + radius)
    window = tile[y1:y2, x1:x2]
    if window.size == 0: return 0
    gray = cv2.cvtColor(window, cv2.COLOR_RGB2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    edges = cv2.dilate(edges, kernel, iterations=1)
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours: return 0
    center = (window.shape[1] // 2, window.shape[0] // 2)
    best_contour, best_dist = None, float('inf')
    for c in contours:
        area_px = cv2.contourArea(c)
        if area_px < 20 or area_px > 4000: continue
        M = cv2.moments(c)
        if M["m00"] == 0: continue
        cx, cy = int(M["m10"] / M["m00"]), int(M["m01"] / M["m00"])
        dist = math.sqrt((cx - center[0])**2 + (cy - center[1])**2)
        if dist < best_dist: best_dist, best_contour = dist, c
    if best_contour is None: return 0
    mpp = meters_per_pixel(lat, TILE_ZOOM)
    return min(cv2.contourArea(best_contour) * mpp * mpp, 5000)


def phase_validate_and_measure(buildings: List[dict], sample_limit: int = 0) -> List[dict]:
    print(f"\n=== VALIDATE & MEASURE: {len(buildings)} buildings ===")
    fetcher = TileFetcher(CACHE_DIR, zoom=TILE_ZOOM)
    to_process = buildings[:sample_limit] if sample_limit > 0 else buildings
    validated, rejected = [], 0
    for i, b in enumerate(to_process):
        if i % 200 == 0 and i > 0:
            print(f"  ... {i}/{len(to_process)} ({len(validated)} valid, {rejected} rejected)")
        window = fetcher.get_window(b["lat"], b["lng"])
        if window is None: continue
        classification = _classify_window(window)
        if classification in ("water", "vegetation", "empty"):
            rejected += 1; continue
        area = calculate_roof_area(fetcher, b["lat"], b["lng"])
        if area > 0: b["area"] = round(area, 1)
        elif b.get("area", 0) <= 0: b["area"] = 80
        if b["area"] > 5000: b["area"] = 80
        validated.append(b)
    if sample_limit > 0:
        validated.extend(buildings[sample_limit:])
    print(f"  Validated: {len(validated)}, Rejected: {rejected}")
    print(f"  {fetcher.stats()}")
    out_path = DATA_DIR / "buildings_validated.json"
    with open(out_path, "w") as f:
        json.dump(validated, f)
    return validated

# ═══════════════════════════════════════════════════════
# Discover island phase
# ═══════════════════════════════════════════════════════

def phase_discover_island(existing: List[dict], max_tiles: int = 2000) -> List[dict]:
    print(f"\n=== DISCOVER: Full island scan ===")
    fetcher = TileFetcher(CACHE_DIR, zoom=SCAN_ZOOM)
    discovered, stats = phase_discover(existing, fetcher, BBOX, max_tiles=max_tiles)
    print(f"  Discovered {len(discovered)} new buildings")
    out_path = DATA_DIR / "buildings_discovered.json"
    with open(out_path, "w") as f:
        json.dump(discovered, f)
    return discovered

# ═══════════════════════════════════════════════════════
# Solar calculation phase
# ═══════════════════════════════════════════════════════

def calculate_solar(buildings: List[dict]) -> List[dict]:
    print(f"\n=== CALCULATE: Solar metrics for {len(buildings)} buildings ===")
    for b in buildings:
        area = b.get("area", 80)
        usable = area * USABLE_AREA_RATIO
        panels = max(1, int(usable / PANEL_AREA_M2))
        kwp = panels * PANEL_WATT / 1000
        annual_kwh = kwp * IRRADIANCE * 365 * PERFORMANCE_RATIO
        annual_savings = annual_kwh * TARIFF_THB
        epc_cost = kwp * EPC_COST_PER_KWP
        payback = epc_cost / annual_savings if annual_savings > 0 else 99
        if kwp >= 50: grade = "A"
        elif kwp >= 20: grade = "B"
        elif kwp >= 5: grade = "C"
        else: grade = "D"
        b.update({"roof_area_sqm": round(area, 1), "potential_kwp": round(kwp, 2),
            "potential_panels": panels, "potential_annual_kwh": round(annual_kwh),
            "potential_monthly_savings_thb": round(annual_savings / 12),
            "potential_grade": grade, "payback_years": round(payback, 1)})
    grades = defaultdict(int)
    for b in buildings: grades[b["potential_grade"]] += 1
    print(f"  Grades: A={grades['A']}, B={grades['B']}, C={grades['C']}, D={grades['D']}")
    return buildings

# ═══════════════════════════════════════════════════════
# Upload phase
# ═══════════════════════════════════════════════════════

def upload_to_supabase(buildings: List[dict], clear_first: bool = False):
    print(f"\n=== UPLOAD: {len(buildings)} buildings to Supabase ===")
    headers = {"apikey": SUPABASE_ANON_KEY, "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates"}
    if clear_first:
        print("  Clearing existing non-manual buildings...")
        requests.delete(f"{SUPABASE_URL}/rest/v1/buildings?source=neq.manual", headers=headers)
    type_map = {"hotel": "hotel", "resort": "resort", "guest_house": "guesthouse",
        "restaurant": "restaurant", "shop": "shop", "retail": "shop",
        "commercial": "office", "office": "office", "industrial": "factory",
        "warehouse": "warehouse", "school": "school", "hospital": "hospital",
        "house": "residential", "residential": "residential", "villa": "villa", "yes": "other"}
    rows = []
    for b in buildings:
        bt = type_map.get((b.get("building_type") or "").lower(), "other")
        rows.append({"name": b.get("name") or f"Building ({b.get('roof_area_sqm', 0):.0f}m2)",
            "lat": b["lat"], "lng": b["lng"], "roof_area_sqm": b.get("roof_area_sqm", 80),
            "building_type": bt, "potential_kwp": b.get("potential_kwp", 0),
            "potential_panels": b.get("potential_panels", 0),
            "potential_annual_kwh": b.get("potential_annual_kwh", 0),
            "potential_monthly_savings_thb": b.get("potential_monthly_savings_thb", 0),
            "potential_grade": b.get("potential_grade", "D"),
            "status": "identified", "source": "import"})
    batch_size = 500
    uploaded = 0
    for i in range(0, len(rows), batch_size):
        batch = rows[i:i+batch_size]
        resp = requests.post(f"{SUPABASE_URL}/rest/v1/buildings", headers=headers, json=batch)
        if resp.status_code in (200, 201):
            uploaded += len(batch)
            print(f"  Uploaded {uploaded}/{len(rows)}")
        else:
            print(f"  ERROR batch {i}: {resp.status_code} {resp.text[:200]}")
    print(f"  Done: {uploaded} buildings uploaded")

# ═══════════════════════════════════════════════════════
# Main entry point
# ═══════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(description="KP Solar Pro — Building Pipeline")
    parser.add_argument("--phase", default="all",
        choices=["all", "download", "merge", "validate", "discover", "calculate", "upload"])
    parser.add_argument("--sample", type=int, default=0)
    parser.add_argument("--max-tiles", type=int, default=2000)
    parser.add_argument("--clear-db", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    print("=" * 60)
    print("KP SOLAR PRO — BUILDING PIPELINE")
    print(f"Bbox: {BBOX}")
    print("=" * 60)

    buildings = []
    merged_path = DATA_DIR / "buildings_merged.json"
    validated_path = DATA_DIR / "buildings_validated.json"

    if args.phase in ("all", "download"):
        osm = download_osm_buildings()
        overture = download_overture_buildings()
        buildings = merge_sources(osm, overture)

    if args.phase in ("all", "validate"):
        if not buildings:
            if merged_path.exists():
                buildings = json.loads(merged_path.read_text())
            else:
                print("ERROR: Run --phase download first"); sys.exit(1)
        buildings = phase_validate_and_measure(buildings, sample_limit=args.sample)

    if args.phase in ("all", "discover"):
        if not buildings and validated_path.exists():
            buildings = json.loads(validated_path.read_text())
        discovered = phase_discover_island(buildings, max_tiles=args.max_tiles)
        buildings.extend(discovered)

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
            for b in buildings: grades[b.get("potential_grade", "?")] += 1
            print(f"  Grades: {dict(grades)}")
        else:
            upload_to_supabase(buildings, clear_first=args.clear_db)

    final_path = DATA_DIR / "buildings_final.json"
    if buildings:
        with open(final_path, "w") as f:
            json.dump(buildings, f)
        print(f"\nFinal: {len(buildings)} buildings -> {final_path}")
    print("\nDone!")


if __name__ == "__main__":
    main()
