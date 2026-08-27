#!/usr/bin/env python3
"""
enrich_solar_api.py — replace heuristic roof maths with Google Solar API geometry.

kp-solar-pro.html currently sizes every system from a flat heuristic
(usable = area * 0.65, kWp = usable * 0.18). That assumes every roof is one
plane, unshaded, at a usable orientation. Google's Solar API returns the actual
roof segments (pitch, azimuth, area per plane), a per-panel layout, and a
modelled annual yield — so the number shown to a prospect can be measured
rather than assumed.

Coverage caveat, measured 2026-08-23: the Solar API covers roughly 67% of Ko
Phangan and only at requiredQuality=LOW, from 2023 imagery. Thong Sala, Ban Tai,
Haad Rin, Sri Thanu, Wok Tum and Haad Yao return data; Chaloklum and Thong Nai
Pan return 404 everywhere tested. So this enriches what it can and leaves the
rest on the heuristic — it is not a wholesale replacement.

BILLING: buildingInsights is a paid Google Maps Platform call. Run --limit
first and check the cost before scanning the whole island.

Output: roof-scanner/solar_api.json
  { "<osm_id>": {kwp, panels, kwh, segs, area, pitch, azimuth, sunshine, img} }

Usage:
  GOOGLE_SOLAR_API_KEY=... python3 scripts/enrich_solar_api.py [--limit N]
"""

import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from threading import Lock

ROOT = Path(__file__).resolve().parent.parent
IN_FILE = ROOT / "roof-scanner" / "buildings_data.js"
OUT_FILE = ROOT / "roof-scanner" / "solar_api.json"

KEY = os.environ.get("GOOGLE_SOLAR_API_KEY")
if not KEY:
    sys.exit("GOOGLE_SOLAR_API_KEY not set")

WORKERS = 6
SAVE_EVERY = 25
PANEL_W = 580          # what Bustan actually installs; Solar API models 400 W


def building_insights(lat, lon):
    qs = urllib.parse.urlencode({
        "location.latitude": lat,
        "location.longitude": lon,
        "requiredQuality": "LOW",   # HIGH/MEDIUM 404 everywhere on this island
        "key": KEY,
    })
    req = urllib.request.Request(
        f"https://solar.googleapis.com/v1/buildingInsights:findClosest?{qs}")
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def summarise(d):
    sp = d.get("solarPotential") or {}
    segs = sp.get("roofSegmentStats") or []
    configs = sp.get("solarPanelConfigs") or []
    if not configs:
        return None
    best = configs[-1]                      # largest configuration offered
    panel_w = sp.get("panelCapacityWatts") or 400

    # Solar API models 400 W panels; restate the same physical array in the
    # module Bustan actually installs so the figure matches a real quote.
    kwp_api = best["panelsCount"] * panel_w / 1000
    panels_580 = int(best["panelsCount"] * panel_w / PANEL_W)

    # area-weighted mean pitch/azimuth across planes, for the proposal sheet
    tot = sum(s.get("stats", {}).get("areaMeters2", 0) for s in segs) or 1
    pitch = sum(s.get("pitchDegrees", 0) * s.get("stats", {}).get("areaMeters2", 0) for s in segs) / tot
    azim = sum(s.get("azimuthDegrees", 0) * s.get("stats", {}).get("areaMeters2", 0) for s in segs) / tot

    img = d.get("imageryDate") or {}
    return {
        "kwp": round(kwp_api, 2),
        "panels": panels_580,
        "kwh": round(best.get("yearlyEnergyDcKwh", 0)),
        "segs": len(segs),
        "area": round(sp.get("wholeRoofStats", {}).get("areaMeters2", 0), 1),
        "pitch": round(pitch, 1),
        "azimuth": round(azim, 1),
        "sunshine": round(sp.get("maxSunshineHoursPerYear", 0)),
        "img": f"{img.get('year')}-{img.get('month')}",
        "quality": d.get("imageryQuality"),
    }


def main():
    raw = IN_FILE.read_text()
    buildings = json.loads(raw[raw.index("["):raw.rindex("]") + 1])

    out = json.loads(OUT_FILE.read_text()) if OUT_FILE.exists() else {}
    todo = [b for b in buildings if str(b["i"]) not in out]
    if "--limit" in sys.argv:
        todo = todo[:int(sys.argv[sys.argv.index("--limit") + 1])]

    print(f"{len(buildings)} buildings · {len(out)} enriched · {len(todo)} to fetch")
    lock = Lock()
    st = {"i": 0, "hit": 0, "miss": 0, "err": 0, "t0": time.time()}

    def work(b):
        try:
            r = summarise(building_insights(b["la"], b["lo"]))
            rec = r or {"none": True}
        except urllib.error.HTTPError as e:
            # 404 is the API saying "no coverage here" — a real answer, not a
            # failure, and worth recording so we never re-bill for this point.
            rec = {"none": True} if e.code == 404 else {"err": f"http_{e.code}"}
        except Exception as e:  # noqa: BLE001
            rec = {"err": str(e)[:40]}

        with lock:
            out[str(b["i"])] = rec
            st["i"] += 1
            if rec.get("err"):
                st["err"] += 1
            elif rec.get("none"):
                st["miss"] += 1
            else:
                st["hit"] += 1
            if st["i"] % SAVE_EVERY == 0:
                OUT_FILE.write_text(json.dumps(out))
                rate = st["i"] / (time.time() - st["t0"])
                print(f"{st['i']}/{len(todo)} · covered {st['hit']} · "
                      f"no-coverage {st['miss']} · err {st['err']} · {rate:.1f}/s", flush=True)

    with ThreadPoolExecutor(max_workers=WORKERS) as ex:
        list(ex.map(work, todo))

    OUT_FILE.write_text(json.dumps(out))
    print(f"\nDONE. {st['i']} queried · {st['hit']} with data · "
          f"{st['miss']} no coverage · {st['err']} errors\n→ {OUT_FILE}")


if __name__ == "__main__":
    main()
