#!/usr/bin/env python3
"""
detect_solar_kp.py — find which Ko Phangan roofs ALREADY have solar.

Reads roof-scanner/buildings_data.js (what kp-solar-pro.html renders), pulls
Esri World Imagery over each building, and asks Gemini whether PV panels sit on
THAT roof. Writes roof-scanner/solar_detected.json, which the map uses to drop
those buildings from the prospect layer.

Two things make this different from the earlier JS attempt and from
bustan-energy/api/cron-detect-solar.ts:

1. Zoom. That cron hardcodes TILE_ZOOM = 19. Esri answers HTTP 200 at z19 over
   Ko Phangan but returns a ~2.5 KB "no data available" placeholder rather than
   imagery (a real z18 tile here is ~13 KB), so it has been scoring blank
   squares. We request z18 and reject any tile small enough to be the
   placeholder.

2. Which roof. A 2x2 z18 block spans ~300 m and contains dozens of buildings.
   Asking "is there solar near the centre" reliably picks up a neighbour's
   array — verified by eye on the first run, where Treechart Hostel was flagged
   because of panels on a warehouse ~30 m north. So we draw the building's own
   footprint onto the image in magenta and ask only about the outlined roof.

Model note: gemini-2.5-flash-lite is RETIRED (404 "no longer available") and is
still first in the chain in cron-detect-solar.ts and find-contact-core.ts.

Resumable: re-running skips buildings already present in the output.

Usage: GEMINI_API_KEY=... python3 scripts/detect_solar_kp.py [--limit N] [--redo]
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
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from threading import Lock

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
IN_FILE = ROOT / "roof-scanner" / "buildings_data.js"
OUT_FILE = ROOT / "roof-scanner" / "solar_detected.json"

# Free-tier Gemini quota is 500 generateContent calls per DAY per project per
# model (quotaId GenerateRequestsPerDayPerProjectPerModel-FreeTier, confirmed
# 2026-08-25). A full island pass needs ~2.5k, so one project cannot finish in a
# day. Quota is per project, so keys from separate GCP projects stack: set
# GEMINI_API_KEYS to a comma-separated list and this rotates across them,
# retiring a (key, model) pair as soon as it reports the daily cap.
GEMINI_KEYS = [k.strip() for k in (
    os.environ.get("GEMINI_API_KEYS") or os.environ.get("GEMINI_API_KEY") or ""
).split(",") if k.strip()]
if not GEMINI_KEYS:
    sys.exit("set GEMINI_API_KEY or GEMINI_API_KEYS")

_exhausted = set()          # (key, model) pairs that hit the daily cap
_key_lock = Lock()

TILE_ZOOM = 18           # highest zoom Esri actually images over Ko Phangan
MIN_TILE_BYTES = 4000    # below this it is the "no data" placeholder
CROP_M = 120             # metres across the crop sent to the model
WORKERS = 3
SAVE_EVERY = 25

MODELS = ["gemini-3.1-flash-lite", "gemini-3.5-flash-lite", "gemini-2.5-flash"]

# Free-tier Gemini is rate limited per minute. The first full island run used 8
# workers with no global limiter and 1,326 of 2,467 buildings came back 429 —
# and a 429 is stored as "no solar", so more than half the island was silently
# marked clear without ever being looked at. A global token bucket is the only
# thing that actually bounds request rate across threads.
RPM_LIMIT = int(os.environ.get("GEMINI_RPM", "12"))
_rate_lock = Lock()
_last_calls = []


def rate_limit():
    while True:
        with _rate_lock:
            now = time.time()
            _last_calls[:] = [t for t in _last_calls if now - t < 60]
            if len(_last_calls) < RPM_LIMIT:
                _last_calls.append(now)
                return
            wait = 60 - (now - _last_calls[0]) + 0.2
        time.sleep(max(0.5, wait))

PROMPT = """This is aerial imagery of Ko Phangan, Thailand. ONE building has its roof outlined with a bright magenta line.

TASK: Determine whether photovoltaic (PV) solar panels are installed on the roof INSIDE the magenta outline.

CRITICAL: Panels on neighbouring roofs outside the outline do NOT count. If the panels are outside the magenta line, answer false.

GUIDANCE:
- Solar panels: a regular grid of dark blue/black rectangular cells, usually in neat rows, often with a visible metal frame and a slight offset shadow.
- Do NOT confuse with: blue- or dark-painted metal roofing (very common in Thailand), skylights, water tanks, AC units, tarpaulins, or shadow.
- A blue roof with no visible cell grid is NOT solar.
- If the outlined roof is obscured, blurry or not visible, answer false with confidence <= 0.25.
- panel_coverage_pct: percent of the outlined roof covered by panels (0 if none).

Return ONLY JSON:
{"has_existing_solar":true|false,"confidence":0.0-1.0,"panel_coverage_pct":0-100}"""

TILE = ("https://server.arcgisonline.com/ArcGIS/rest/services/"
        "World_Imagery/MapServer/tile/{z}/{y}/{x}")


# Neighbouring buildings share most of their 3x3 tile block, so a plain cache
# removes the large majority of the ~22k tile fetches a full island run needs.
_TILE_CACHE = {}
_TILE_LOCK = Lock()


def fetch_tile(z, y, x):
    key = (z, y, x)
    with _TILE_LOCK:
        hit = _TILE_CACHE.get(key)
    if hit is not None:
        if isinstance(hit, Exception):
            raise hit
        return hit
    try:
        req = urllib.request.Request(TILE.format(z=z, y=y, x=x),
                                     headers={"User-Agent": "bustan-solar-scan/1.0"})
        data = urllib.request.urlopen(req, timeout=20).read()
        if len(data) < MIN_TILE_BYTES:
            raise ValueError(f"placeholder_tile_{len(data)}b")
        img = Image.open(io.BytesIO(data)).convert("RGB")
    except Exception as e:  # noqa: BLE001
        with _TILE_LOCK:
            if len(_TILE_CACHE) < 6000:
                _TILE_CACHE[key] = e
        raise
    with _TILE_LOCK:
        if len(_TILE_CACHE) < 6000:
            _TILE_CACHE[key] = img
    return img


def lonlat_to_px(lon, lat, z):
    """Global pixel coords at zoom z (256 px tiles)."""
    n = 2 ** z * 256
    px = (lon + 180.0) / 360.0 * n
    py = (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n
    return px, py


def build_image(b):
    """3x3 z18 tiles around the building, footprint drawn on, cropped to CROP_M."""
    lat, lon = b["la"], b["lo"]
    cx, cy = lonlat_to_px(lon, lat, TILE_ZOOM)
    tx, ty = int(cx // 256), int(cy // 256)

    # Fetch the 3x3 block concurrently. Serially this dominated runtime: 9 tiles
    # at ~2 s each made image assembly 20 s against a 3 s model call.
    coords = [(dx, dy) for dy in (-1, 0, 1) for dx in (-1, 0, 1)]
    with ThreadPoolExecutor(max_workers=9) as tex:
        tiles = list(tex.map(lambda c: fetch_tile(TILE_ZOOM, ty + c[1], tx + c[0]), coords))
    canvas = Image.new("RGB", (768, 768))
    for (dx, dy), tile in zip(coords, tiles):
        canvas.paste(tile, ((dx + 1) * 256, (dy + 1) * 256))

    # canvas origin in global pixel space
    ox, oy = (tx - 1) * 256, (ty - 1) * 256

    if b.get("poly"):
        pts = [(lonlat_to_px(p[0], p[1], TILE_ZOOM)[0] - ox,
                lonlat_to_px(p[0], p[1], TILE_ZOOM)[1] - oy) for p in b["poly"]]
        d = ImageDraw.Draw(canvas)
        d.line(pts + [pts[0]], fill=(255, 0, 255), width=3)

    # metres per pixel at this latitude, then crop a CROP_M box around the centre
    mpp = 156543.03392 * math.cos(math.radians(lat)) / (2 ** TILE_ZOOM)
    half = max(64, int(CROP_M / mpp / 2))
    px, py = cx - ox, cy - oy
    box = (int(px - half), int(py - half), int(px + half), int(py + half))
    crop = canvas.crop(box).resize((640, 640), Image.LANCZOS)

    buf = io.BytesIO()
    crop.save(buf, format="JPEG", quality=88)
    return buf.getvalue()


VERDICT_RE = re.compile(r'\{[^{}]*"has_existing_solar"[\s\S]*?\}')


def call_gemini(jpeg):
    import base64
    b64 = base64.b64encode(jpeg).decode()
    last = ""
    pairs = [(k, m) for m in MODELS for k in GEMINI_KEYS]
    for GEMINI_KEY, model in pairs:
        with _key_lock:
            if (GEMINI_KEY, model) in _exhausted:
                continue
        for attempt in range(3):
            try:
                rate_limit()
                body = json.dumps({
                    "contents": [{"parts": [
                        {"text": PROMPT},
                        {"inline_data": {"mime_type": "image/jpeg", "data": b64}},
                    ]}],
                    "generationConfig": {"temperature": 0, "maxOutputTokens": 300},
                }).encode()
                req = urllib.request.Request(
                    f"https://generativelanguage.googleapis.com/v1beta/models/"
                    f"{model}:generateContent?key={GEMINI_KEY}",
                    data=body, headers={"Content-Type": "application/json"})
                with urllib.request.urlopen(req, timeout=60) as r:
                    j = json.loads(r.read())
                text = j["candidates"][0]["content"]["parts"][0]["text"]
                m = VERDICT_RE.search(text)
                if not m:
                    last = "no_json"
                    break
                v = json.loads(m.group(0))
                return {
                    "s": v.get("has_existing_solar") in (True, "true"),
                    "c": float(v.get("confidence") or 0),
                    "p": float(v.get("panel_coverage_pct") or 0),
                }
            except urllib.error.HTTPError as e:
                last = f"{e.code}_{model}"
                if e.code == 429:
                    # Distinguish "too fast" from "done for today": only the
                    # per-day quota makes this key+model permanently useless.
                    try:
                        body = e.read().decode()
                    except Exception:  # noqa: BLE001
                        body = ""
                    if "PerDay" in body or "per day" in body.lower():
                        with _key_lock:
                            _exhausted.add((GEMINI_KEY, model))
                        last = f"daily_quota_{model}"
                        break
                    time.sleep(2 ** attempt * 2 + random.random())
                    continue
                if e.code == 503:
                    time.sleep(2 ** attempt * 2 + random.random())
                    continue
                break
            except Exception as e:  # noqa: BLE001
                last = str(e)[:40]
                time.sleep(1.5 * (attempt + 1))
    raise RuntimeError(last or "all_models_failed")


def main():
    raw = IN_FILE.read_text()
    buildings = json.loads(raw[raw.index("["):raw.rindex("]") + 1])

    out = json.loads(OUT_FILE.read_text()) if OUT_FILE.exists() and "--redo" not in sys.argv else {}

    # A stored err means the roof was never actually looked at, and the record
    # says "no solar" — so those must be retried, not skipped. Placeholder-tile
    # failures are permanent at this zoom and stay put.
    if "--retry-errors" in sys.argv:
        for k, v in list(out.items()):
            if v.get("err") and not v["err"].startswith("placeholder"):
                del out[k]

    todo = [b for b in buildings if str(b["i"]) not in out]
    if "--limit" in sys.argv:
        todo = todo[:int(sys.argv[sys.argv.index("--limit") + 1])]

    # Walk the island in tile order. Consecutive buildings then share most of
    # their 3x3 block, so the tile cache actually hits instead of thrashing.
    def tile_key(b):
        n = 2 ** TILE_ZOOM
        tx = int((b["lo"] + 180) / 360 * n)
        ty = int((1 - math.asinh(math.tan(math.radians(b["la"]))) / math.pi) / 2 * n)
        return (ty, tx)
    todo.sort(key=tile_key)

    print(f"{len(buildings)} buildings · {len(out)} already checked · {len(todo)} to do")
    lock = Lock()
    state = {"done": 0, "solar": 0, "failed": 0, "t0": time.time()}

    def work(b):
        try:
            r = call_gemini(build_image(b))
        except Exception as e:  # noqa: BLE001
            r = {"s": False, "c": 0, "p": 0, "err": str(e)[:40]}
        with lock:
            out[str(b["i"])] = r
            state["done"] += 1
            if r.get("err"):
                state["failed"] += 1
            elif r["s"] and r["c"] >= 0.5:
                state["solar"] += 1
            if state["done"] % SAVE_EVERY == 0:
                OUT_FILE.write_text(json.dumps(out))
                rate = state["done"] / (time.time() - state["t0"])
                eta = (len(todo) - state["done"]) / rate / 60 if rate else 0
                print(f"{state['done']}/{len(todo)} · solar {state['solar']} · "
                      f"failed {state['failed']} · {rate:.1f}/s · ETA {eta:.0f}m", flush=True)

    with ThreadPoolExecutor(max_workers=WORKERS) as ex:
        list(ex.map(work, todo))

    OUT_FILE.write_text(json.dumps(out))
    confident = sum(1 for v in out.values() if v.get("s") and v.get("c", 0) >= 0.5)
    print(f"\nDONE. {len(out)} checked · {confident} have existing solar (conf >= 0.5) "
          f"· {state['failed']} failed this run\n→ {OUT_FILE}")


if __name__ == "__main__":
    main()
