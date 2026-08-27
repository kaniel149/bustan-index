#!/usr/bin/env python3
"""
find_new_buildings.py — find Ko Phangan roofs that exist in the 2026 imagery but
in none of our datasets.

Our building list came from OSM/drone work and the map's snapshot is dated
2026-04-19. Esri's current imagery over the island was captured 2026-01-14 to
2026-04-07 (WorldView Legion, 0.34 m). Anything built — or simply never mapped —
is invisible to the prospect pipeline. This finds those roofs.

Method
------
For each z18 tile that already contains at least one known building (i.e. the
populated parts of the island), ask Gemini for the bounding box of EVERY
building roof it can see, then discard the ones that land near a building we
already know about. Dedupe happens in code against the full 30k known-building
set rather than by asking the model to ignore marked roofs — the model only has
to do the part it is good at (seeing roofs), and "is this one new?" stays exact.

Gemini returns boxes as [ymin, xmin, ymax, xmax] normalised to 0-1000.

Output: roof-scanner/new_buildings.json
  [{lat, lon, w_m, h_m, area_m2, tile:[z,x,y], conf}]

Usage:
  GEMINI_API_KEY=... python3 scripts/find_new_buildings.py \
      --known /tmp/known_buildings.json [--limit N] [--min-buildings 5]
"""

import io
import json
import math
import os
import random
import re
import sys
import time
import urllib.error
import urllib.request
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from threading import Lock

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT_FILE = ROOT / "roof-scanner" / "new_buildings.json"
STATE_FILE = ROOT / "roof-scanner" / ".new_buildings_progress.json"

GEMINI_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_KEY:
    sys.exit("GEMINI_API_KEY not set")

TILE_ZOOM = 18
MIN_TILE_BYTES = 4000
RENDER_PX = 768          # upscale the 256 px tile so small roofs stay legible
DEDUPE_M = 18            # a detection this close to a known building is that building
MIN_AREA_M2 = 40         # ignore sheds/shade sails
WORKERS = 3
RPM_LIMIT = int(os.environ.get("GEMINI_RPM", "12"))

MODELS = ["gemini-3.1-flash-lite", "gemini-3.5-flash-lite", "gemini-2.5-flash"]

PROMPT = """Aerial image of Ko Phangan, Thailand, roughly 150 m across.

TASK: Return a bounding box for EVERY building roof visible in this image.

Count as buildings: houses, bungalows, resorts, shops, warehouses, restaurants,
temples — anything with a solid constructed roof.
Do NOT count: swimming pools, roads, vehicles, tarpaulins over open ground,
tree canopy, bare concrete slabs with no roof, boats.

Include partial buildings at the image edge.

Return ONLY a JSON array, no markdown fences:
[{"box_2d":[ymin,xmin,ymax,xmax],"label":"building"}]
Coordinates normalised 0-1000. Return [] if there are no buildings."""

TILE = ("https://server.arcgisonline.com/ArcGIS/rest/services/"
        "World_Imagery/MapServer/tile/{z}/{y}/{x}")

_rate_lock = Lock()
_calls = []


def rate_limit():
    while True:
        with _rate_lock:
            now = time.time()
            _calls[:] = [t for t in _calls if now - t < 60]
            if len(_calls) < RPM_LIMIT:
                _calls.append(now)
                return
            wait = 60 - (now - _calls[0]) + 0.2
        time.sleep(max(0.5, wait))


def fetch_tile(z, y, x):
    req = urllib.request.Request(TILE.format(z=z, y=y, x=x),
                                 headers={"User-Agent": "bustan-newbuild-scan/1.0"})
    data = urllib.request.urlopen(req, timeout=25).read()
    if len(data) < MIN_TILE_BYTES:
        raise ValueError(f"placeholder_tile_{len(data)}b")
    return Image.open(io.BytesIO(data)).convert("RGB")


def tile_bounds(z, x, y):
    """(lon_w, lat_n, lon_e, lat_s) of a slippy tile."""
    n = 2.0 ** z
    lon_w = x / n * 360.0 - 180.0
    lon_e = (x + 1) / n * 360.0 - 180.0
    lat_n = math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * y / n))))
    lat_s = math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * (y + 1) / n))))
    return lon_w, lat_n, lon_e, lat_s


ARRAY_RE = re.compile(r"\[\s*\{.*\}\s*\]", re.S)


def call_gemini(jpeg):
    import base64
    b64 = base64.b64encode(jpeg).decode()
    last = ""
    for model in MODELS:
        for attempt in range(3):
            try:
                rate_limit()
                body = json.dumps({
                    "contents": [{"parts": [
                        {"text": PROMPT},
                        {"inline_data": {"mime_type": "image/jpeg", "data": b64}},
                    ]}],
                    "generationConfig": {"temperature": 0, "maxOutputTokens": 4000},
                }).encode()
                req = urllib.request.Request(
                    f"https://generativelanguage.googleapis.com/v1beta/models/"
                    f"{model}:generateContent?key={GEMINI_KEY}",
                    data=body, headers={"Content-Type": "application/json"})
                with urllib.request.urlopen(req, timeout=90) as r:
                    j = json.loads(r.read())
                text = j["candidates"][0]["content"]["parts"][0]["text"]
                if "[]" in text and "box_2d" not in text:
                    return []
                m = ARRAY_RE.search(text)
                if not m:
                    last = "no_json"
                    break
                return json.loads(m.group(0))
            except urllib.error.HTTPError as e:
                last = f"{e.code}_{model}"
                if e.code in (429, 503):
                    time.sleep(2 ** attempt * 3 + random.random())
                    continue
                break
            except Exception as e:  # noqa: BLE001
                last = str(e)[:50]
                time.sleep(1.5 * (attempt + 1))
    raise RuntimeError(last or "all_models_failed")


def main():
    argv = sys.argv
    known_path = argv[argv.index("--known") + 1] if "--known" in argv else "/tmp/known_buildings.json"
    limit = int(argv[argv.index("--limit") + 1]) if "--limit" in argv else None
    min_b = int(argv[argv.index("--min-buildings") + 1]) if "--min-buildings" in argv else 1

    known = [b for b in json.load(open(known_path)) if b.get("lat") and b.get("lng")]

    # index known buildings by z18 tile, and by a coarse grid for fast dedupe
    by_tile = defaultdict(list)
    grid = defaultdict(list)
    n = 2 ** TILE_ZOOM
    for b in known:
        lat, lon = b["lat"], b["lng"]
        tx = int((lon + 180) / 360 * n)
        ty = int((1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n)
        by_tile[(tx, ty)].append(b)
        grid[(round(lat, 3), round(lon, 3))].append((lat, lon))

    tiles = [t for t, bs in by_tile.items() if len(bs) >= min_b]
    tiles.sort(key=lambda t: -len(by_tile[t]))   # densest first — best prospects
    if limit:
        tiles = tiles[:limit]

    done = json.loads(STATE_FILE.read_text()) if STATE_FILE.exists() else {}
    found = json.loads(OUT_FILE.read_text()) if OUT_FILE.exists() else []
    todo = [t for t in tiles if f"{t[0]}_{t[1]}" not in done]

    print(f"{len(known)} known buildings · {len(tiles)} candidate tiles "
          f"(>= {min_b} known each) · {len(todo)} to scan")

    lock = Lock()
    state = {"i": 0, "new": 0, "err": 0, "t0": time.time()}

    def near_known(lat, lon):
        for dlat in (-0.001, 0, 0.001):
            for dlon in (-0.001, 0, 0.001):
                for klat, klon in grid.get((round(lat + dlat, 3), round(lon + dlon, 3)), ()):
                    dy = (klat - lat) * 111320
                    dx = (klon - lon) * 111320 * math.cos(math.radians(lat))
                    if dy * dy + dx * dx < DEDUPE_M * DEDUPE_M:
                        return True
        return False

    def work(t):
        tx, ty = t
        key = f"{tx}_{ty}"
        try:
            img = fetch_tile(TILE_ZOOM, ty, tx).resize((RENDER_PX, RENDER_PX), Image.LANCZOS)
            buf = io.BytesIO()
            img.save(buf, format="JPEG", quality=88)
            boxes = call_gemini(buf.getvalue())
        except Exception as e:  # noqa: BLE001
            with lock:
                done[key] = {"err": str(e)[:40]}
                state["i"] += 1
                state["err"] += 1
            return

        lon_w, lat_n, lon_e, lat_s = tile_bounds(TILE_ZOOM, tx, ty)
        mpp = 156543.03392 * math.cos(math.radians((lat_n + lat_s) / 2)) / (2 ** TILE_ZOOM)
        new_here = []
        for bx in boxes:
            try:
                ymin, xmin, ymax, xmax = [float(v) for v in bx["box_2d"]]
            except Exception:  # noqa: BLE001
                continue
            cy, cx = (ymin + ymax) / 2 / 1000, (xmin + xmax) / 2 / 1000
            lat = lat_n + (lat_s - lat_n) * cy
            lon = lon_w + (lon_e - lon_w) * cx
            w_m = (xmax - xmin) / 1000 * 256 * mpp
            h_m = (ymax - ymin) / 1000 * 256 * mpp
            area = w_m * h_m
            if area < MIN_AREA_M2 or near_known(lat, lon):
                continue
            new_here.append({"lat": round(lat, 6), "lon": round(lon, 6),
                             "w_m": round(w_m, 1), "h_m": round(h_m, 1),
                             "area_m2": round(area), "tile": [TILE_ZOOM, tx, ty]})

        with lock:
            done[key] = {"boxes": len(boxes), "new": len(new_here)}
            found.extend(new_here)
            state["i"] += 1
            state["new"] += len(new_here)
            if state["i"] % 10 == 0:
                STATE_FILE.write_text(json.dumps(done))
                OUT_FILE.write_text(json.dumps(found))
                rate = state["i"] / (time.time() - state["t0"])
                eta = (len(todo) - state["i"]) / rate / 60 if rate else 0
                print(f"{state['i']}/{len(todo)} tiles · new {state['new']} · "
                      f"err {state['err']} · ETA {eta:.0f}m", flush=True)

    with ThreadPoolExecutor(max_workers=WORKERS) as ex:
        list(ex.map(work, todo))

    STATE_FILE.write_text(json.dumps(done))
    OUT_FILE.write_text(json.dumps(found))
    print(f"\nDONE. {state['i']} tiles scanned · {len(found)} unmapped roofs found "
          f"· {state['err']} tile errors\n→ {OUT_FILE}")


if __name__ == "__main__":
    main()
