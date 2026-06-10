# KP Solar Pro — Improvement Design

**Date:** 2026-03-29
**Goal:** Make KP Solar Pro a pixel-accurate, complete solar prospecting tool for Koh Phangan

## Vision

Every building on Koh Phangan in the database with accurate data, and a system that improves every time new drone photos are added.

## Approach: Fix Data First

UI improvements come after data is trustworthy. No point in a beautiful interface showing wrong numbers.

---

## Phase 1: Data Cleanup

**Problem:** 2,467 buildings with bad data (500K sqm roofs, wrong grades, ghost buildings)

**Solution:** Re-validate every building against Google Satellite zoom 19 (~0.3m/pixel):
1. Download 256x256 satellite tile around each building coordinate
2. Color analysis to filter water, vegetation, roads (reject false positives)
3. Contour detection to calculate real roof area in m²
4. Recalculate solar metrics with corrected area:
   - usable_area = roof_area × 0.65
   - panels = floor(usable_area / 2.0)
   - kwp = panels × 0.55
   - annual_kwh = kwp × 5.1 × 365 × 0.8
   - monthly_savings = (annual_kwh × 4.5) / 12
   - grade: A (≥50kWp) | B (≥20) | C (≥5) | D (<5)
5. Delete false buildings (water, forest, road)

**Expected result:** ~1,500-2,000 validated buildings with accurate data

---

## Phase 2: Full Island Scan

**Problem:** OSM data incomplete — many buildings not mapped, especially rural areas

**Solution:** 3 data sources merged:
1. **OSM** (Overpass API) — all `building=*` in Koh Phangan bbox (9.695-9.800, 99.960-100.020)
2. **Overture Maps** — Microsoft/Meta ML-detected building footprints
3. **Satellite grid scan** — sweep entire island at zoom 19, detect buildings via edge/contour analysis

**Merge process:**
- Deduplicate by proximity (< 12m = same building, keep richest data)
- Validate all new buildings (Phase 1 pipeline)
- Upsert to Supabase

**Expected result:** 5,000-8,000 buildings covering every rooftop on the island

---

## Phase 3: Drone Pipeline

**Problem:** Adding drone photos is manual and complex

**Solution:** Single workflow triggered by "new photos at [location]":
1. Extract metadata (GPS, altitude, gimbal angles)
2. ODM batch processing (split by area, ≤30 photos per batch for 8GB RAM)
3. Reproject orthomosaic to WGS84
4. Generate XYZ tiles (zoom 18-19)
5. Clean nodata/transparent tiles
6. Detect buildings in new coverage area (higher accuracy than satellite — ~2cm/pixel vs 30cm)
7. Update Supabase (new buildings + improved data for existing)
8. Merge tiles with existing set
9. Deploy to GitHub Pages

**Rules:**
- Batches of ≤30 photos (RAM constraint)
- Drone data overrides satellite data (higher resolution = more accurate)
- New buildings auto-validated before DB insert
- Existing tiles preserved — new tiles merged on top

---

## Phase 4: Map Fix

After clean data + working pipeline:
- Circle markers colored by grade (already done)
- Drone HD layer with clean tiles (nodata fixed)
- Popups showing accurate data
- Bounds auto-adjusted to actual coverage

---

## Architecture

```
Platform: index.bustan-energy.com/platform/pro/
Backend: Supabase (trvgpgpsqvvdsudpgwpm)
Tiles: GitHub Pages (drone-tiles/v2/)
Photos: drone-imagery/ (122 georeferenced WebP)

Data Pipeline:
  OSM + Overture + Satellite → Merge/Dedup → Validate → Supabase

Drone Pipeline:
  New photos → ODM → GeoTIFF → Tiles → Building Detection → Supabase → Deploy

Tables:
  buildings — id, name, lat, lng, roof_area_sqm, potential_kwp, potential_grade, status, ...
  leads — id, building_id, contact_name, stage, deal_value_thb, ...
  activities — id, lead_id, building_id, type, description, ...
  zones — id, name, boundary, ...
```

## Success Criteria

1. Every building on the island is in the DB (>5,000)
2. Roof area accurate to ±10% vs reality
3. No ghost buildings (water, forest, road)
4. Drone photos integrate seamlessly — no orange artifacts
5. "New photos at X" → updated map within 1 hour
