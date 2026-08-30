#!/usr/bin/env python3
"""
classify_footprints.py — tell roofs apart from land parcels.

The map sizes every system as `footprint * 0.65 * 0.18 kWp`, which assumes the
OSM polygon traces a roof. Often it does not. "Kuul Villas" is a 5,763 m2
polygon around a strip of jungle holding a handful of small villas; the
heuristic turns that into 733 kWp and grades it A, so the most attractive lead
on the map is the least real. Checking a sample against Google's Solar API,
5 of 60 buildings disagreed by more than 5x and those 5 held 26% of the whole
pipeline's kWp.

Rather than buy Solar API coverage for all 2,467 (paid, and it undercounts
compounds because findClosest returns one building), ask the imagery directly:
draw the polygon and have a vision model say whether it encloses one roof, a
compound, or open land — and what share of it is actually roof.

Output: roof-scanner/footprint_quality.json
  { "<osm_id>": {"k": roof|compound|parcel|unclear, "roof_pct": 0-100,
                 "n": buildings seen, "c": confidence, "why": "..."} }

Usage: GEMINI_API_KEYS=... python3 scripts/classify_footprints.py [--limit N]
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
OUT_FILE = ROOT / "roof-scanner" / "footprint_quality.json"

KEYS = [k.strip() for k in (os.environ.get("GEMINI_API_KEYS")
                            or os.environ.get("GEMINI_API_KEY") or "").split(",") if k.strip()]
if not KEYS:
    sys.exit("set GEMINI_API_KEY or GEMINI_API_KEYS")

TILE_ZOOM = 18
MIN_TILE_BYTES = 4000
WORKERS = 6
SAVE_EVERY = 25
RPM = int(os.environ.get("GEMINI_RPM", "150"))
MODELS = ["gemini-3.1-flash-lite", "gemini-3.5-flash-lite", "gemini-2.5-flash"]

PROMPT = """Aerial imagery of Ko Phangan, Thailand. A magenta outline marks one entry from a buildings database.

TASK: Say what the outline actually encloses. The database assumes it traces a single building roof; often it traces a land parcel instead.

Categories:
- "roof": the outline follows one building's roof, give or take a few metres.
- "compound": the outline holds several separate structures — a resort of bungalows, a cluster of villas — with gaps of ground or vegetation between them.
- "parcel": the outline is mostly land — trees, scrub, bare earth, a car park, a pool — with little or no roof inside it.
- "unclear": too blurry or obscured to tell.

Also estimate roof_pct: the percentage of the outlined area that is actually building roof. A single well-traced roof is near 100. A resort of bungalows in a garden might be 15-30. Open land is near 0.

And n_buildings: how many separate roofed structures sit inside the outline.

Return ONLY JSON:
{"kind":"roof|compound|parcel|unclear","roof_pct":0-100,"n_buildings":0,"confidence":0.0-1.0,"why":"<max 12 words>"}"""

TILE = ("https://server.arcgisonline.com/ArcGIS/rest/services/"
        "World_Imagery/MapServer/tile/{z}/{y}/{x}")

_rate_lock = Lock()
_calls = []
_exhausted = set()
_key_lock = Lock()
_cache = {}
_cache_lock = Lock()


def rate_limit():
    while True:
        with _rate_lock:
            now = time.time()
            _calls[:] = [t for t in _calls if now - t < 60]
            if len(_calls) < RPM:
                _calls.append(now)
                return
            wait = 60 - (now - _calls[0]) + 0.2
        time.sleep(max(0.5, wait))


def fetch_tile(z, y, x):
    key = (z, y, x)
    with _cache_lock:
        hit = _cache.get(key)
    if hit is not None:
        if isinstance(hit, Exception):
            raise hit
        return hit
    try:
        req = urllib.request.Request(TILE.format(z=z, y=y, x=x),
                                     headers={"User-Agent": "bustan-fpq/1.0"})
        data = urllib.request.urlopen(req, timeout=25).read()
        if len(data) < MIN_TILE_BYTES:
            raise ValueError(f"placeholder_tile_{len(data)}b")
        img = Image.open(io.BytesIO(data)).convert("RGB")
    except Exception as e:  # noqa: BLE001
        with _cache_lock:
            if len(_cache) < 8000:
                _cache[key] = e
        raise
    with _cache_lock:
        if len(_cache) < 8000:
            _cache[key] = img
    return img


def px(lon, lat, z):
    n = 2 ** z * 256
    return ((lon + 180.0) / 360.0 * n,
            (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n)


def build_image(b):
    """Crop scales with the polygon: a parcel 200 m long must fit in frame."""
    lat, lon = b["la"], b["lo"]
    poly = b.get("poly") or []
    mpp = 156543.03392 * math.cos(math.radians(lat)) / (2 ** TILE_ZOOM)

    if poly:
        lons = [p[0] for p in poly]; lats = [p[1] for p in poly]
        w_m = (max(lons) - min(lons)) * 111320 * math.cos(math.radians(lat))
        h_m = (max(lats) - min(lats)) * 111320
        span = max(w_m, h_m)
    else:
        span = 60
    # 60 m of context around the polygon, clamped so a huge parcel still fits
    crop_m = min(max(span * 1.6, 90), 600)
    half_px = crop_m / mpp / 2

    cx, cy = px(lon, lat, TILE_ZOOM)
    reach = int(half_px // 256) + 2
    tx, ty = int(cx // 256), int(cy // 256)
    size = (2 * reach + 1) * 256
    canvas = Image.new("RGB", (size, size))
    coords = [(dx, dy) for dy in range(-reach, reach + 1) for dx in range(-reach, reach + 1)]

    # A wide crop spans many tiles, and near the edge of Esri's coverage some of
    # them come back as the "no data" placeholder. Losing one corner tile must
    # not cost us the whole building — paste a neutral square and carry on. Only
    # a missing centre tile makes the image useless, since that is where the
    # polygon sits.
    def grab(c):
        try:
            return fetch_tile(TILE_ZOOM, ty + c[1], tx + c[0]), True
        except Exception:  # noqa: BLE001
            return Image.new("RGB", (256, 256), (34, 34, 34)), False

    with ThreadPoolExecutor(max_workers=min(12, len(coords))) as tex:
        tiles = list(tex.map(grab, coords))
    for (dx, dy), (t, ok) in zip(coords, tiles):
        if (dx, dy) == (0, 0) and not ok:
            raise ValueError("placeholder_tile_centre")
        canvas.paste(t, ((dx + reach) * 256, (dy + reach) * 256))

    ox, oy = (tx - reach) * 256, (ty - reach) * 256
    if poly:
        pts = [(px(p[0], p[1], TILE_ZOOM)[0] - ox, px(p[0], p[1], TILE_ZOOM)[1] - oy) for p in poly]
        ImageDraw.Draw(canvas).line(pts + [pts[0]], fill=(255, 0, 255), width=max(2, int(half_px / 90)))

    box = (int(cx - ox - half_px), int(cy - oy - half_px),
           int(cx - ox + half_px), int(cy - oy + half_px))
    crop = canvas.crop(box).resize((768, 768), Image.LANCZOS)
    buf = io.BytesIO()
    crop.save(buf, format="JPEG", quality=88)
    return buf.getvalue()


VERDICT = re.compile(r'\{[^{}]*"kind"[\s\S]*?\}')


def call_gemini(jpeg):
    import base64
    b64 = base64.b64encode(jpeg).decode()
    last = ""
    for model in MODELS:
        for key in KEYS:
            with _key_lock:
                if (key, model) in _exhausted:
                    continue
            for attempt in range(3):
                try:
                    rate_limit()
                    body = json.dumps({
                        "contents": [{"parts": [
                            {"text": PROMPT},
                            {"inline_data": {"mime_type": "image/jpeg", "data": b64}},
                        ]}],
                        "generationConfig": {"temperature": 0, "maxOutputTokens": 400},
                    }).encode()
                    req = urllib.request.Request(
                        f"https://generativelanguage.googleapis.com/v1beta/models/"
                        f"{model}:generateContent?key={key}",
                        data=body, headers={"Content-Type": "application/json"})
                    with urllib.request.urlopen(req, timeout=60) as r:
                        j = json.loads(r.read())
                    text = j["candidates"][0]["content"]["parts"][0]["text"]
                    m = VERDICT.search(text)
                    if not m:
                        last = "no_json"
                        break
                    v = json.loads(m.group(0))
                    return {
                        "k": str(v.get("kind", "unclear")),
                        "roof_pct": float(v.get("roof_pct") or 0),
                        "n": int(v.get("n_buildings") or 0),
                        "c": float(v.get("confidence") or 0),
                        "why": str(v.get("why", ""))[:60],
                    }
                except urllib.error.HTTPError as e:
                    last = f"{e.code}_{model}"
                    if e.code == 429:
                        try:
                            body_t = e.read().decode()
                        except Exception:  # noqa: BLE001
                            body_t = ""
                        if "PerDay" in body_t:
                            with _key_lock:
                                _exhausted.add((key, model))
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
    raise RuntimeError(last or "all_failed")


def main():
    raw = IN_FILE.read_text()
    buildings = json.loads(raw[raw.index("["):raw.rindex("]") + 1])
    out = json.loads(OUT_FILE.read_text()) if OUT_FILE.exists() else {}
    if "--retry-errors" in sys.argv:
        for k, v in list(out.items()):
            if v.get("err") and not v["err"].startswith("placeholder"):
                del out[k]
    todo = [b for b in buildings if str(b["i"]) not in out]

    def tkey(b):
        n = 2 ** TILE_ZOOM
        return (int((1 - math.asinh(math.tan(math.radians(b["la"]))) / math.pi) / 2 * n),
                int((b["lo"] + 180) / 360 * n))
    todo.sort(key=tkey)
    if "--limit" in sys.argv:
        todo = todo[:int(sys.argv[sys.argv.index("--limit") + 1])]

    print(f"{len(buildings)} buildings · {len(out)} done · {len(todo)} to classify")
    lock = Lock()
    st = {"i": 0, "parcel": 0, "compound": 0, "err": 0, "t0": time.time()}

    def work(b):
        try:
            r = call_gemini(build_image(b))
        except Exception as e:  # noqa: BLE001
            r = {"err": str(e)[:40]}
        with lock:
            out[str(b["i"])] = r
            st["i"] += 1
            if r.get("err"):
                st["err"] += 1
            elif r["k"] == "parcel":
                st["parcel"] += 1
            elif r["k"] == "compound":
                st["compound"] += 1
            if st["i"] % SAVE_EVERY == 0:
                OUT_FILE.write_text(json.dumps(out))
                rate = st["i"] / (time.time() - st["t0"])
                print(f"{st['i']}/{len(todo)} · parcel {st['parcel']} · compound {st['compound']} "
                      f"· err {st['err']} · {rate:.1f}/s · ETA {(len(todo)-st['i'])/rate/60:.0f}m",
                      flush=True)

    with ThreadPoolExecutor(max_workers=WORKERS) as ex:
        list(ex.map(work, todo))
    OUT_FILE.write_text(json.dumps(out))
    print(f"\nDONE. {st['i']} classified · {st['parcel']} parcels · "
          f"{st['compound']} compounds · {st['err']} errors\n→ {OUT_FILE}")


if __name__ == "__main__":
    main()
