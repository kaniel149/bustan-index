#!/usr/bin/env python3
"""Render outlined roof images to disk. No API key, no quota — Esri tiles + PIL.

Produces the same framing detect_solar_kp.py sends to Gemini (3x3 z18 tiles,
building footprint drawn in magenta, cropped to 120 m) but writes JPEGs so any
vision model — including a Claude subagent reading them off disk — can judge
them. Filenames carry the OSM id so verdicts map back cleanly.

Usage: python3 scripts/render_roofs.py --out /tmp/roofs --count 12 [--only-unchecked]
"""
import json, sys, importlib.util
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("d", ROOT / "scripts" / "detect_solar_kp.py")
import os
os.environ.setdefault("GEMINI_API_KEY", "unused-render-only")
d = importlib.util.module_from_spec(spec); spec.loader.exec_module(d)

argv = sys.argv
out = Path(argv[argv.index("--out") + 1] if "--out" in argv else "/tmp/roofs")
count = int(argv[argv.index("--count") + 1]) if "--count" in argv else 20
out.mkdir(parents=True, exist_ok=True)

raw = (ROOT / "roof-scanner" / "buildings_data.js").read_text()
B = json.loads(raw[raw.index("["):raw.rindex("]") + 1])

if "--only-unchecked" in argv:
    det = json.loads((ROOT / "roof-scanner" / "solar_detected.json").read_text())
    B = [b for b in B if str(b["i"]) not in det or det[str(b["i"])].get("err")]
if "--ids" in argv:
    want = set(argv[argv.index("--ids") + 1].split(","))
    B = [b for b in B if str(b["i"]) in want]

B = B[:count]

def render(b):
    try:
        (out / f"{b['i']}.jpg").write_bytes(d.build_image(b))
        return b["i"]
    except Exception as e:
        return f"ERR {b['i']} {e}"

with ThreadPoolExecutor(max_workers=8) as ex:
    res = list(ex.map(render, B))
ok = [r for r in res if not str(r).startswith("ERR")]
print(f"rendered {len(ok)}/{len(B)} -> {out}")
manifest = {str(b["i"]): {"name": b["n"], "area": b["a"], "lat": b["la"], "lon": b["lo"]} for b in B}
(out / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=1))
for r in res:
    if str(r).startswith("ERR"): print(" ", r)
