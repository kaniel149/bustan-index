# Presentations — number validation

Generated 2026-09-03 by `presentations/tools/validate_numbers.py`; §2 and §4 updated by hand 2026-09-04/05 after the SPEC decisions. **This file reports; a human decides.**

## 1. Workbook copies (cell-level diff)

- A = `bustan-index/Ko_Phangan_Solar_Business_Plan.xlsx`
- B = `bustan-energy/_retired/business/finance/Ko_Phangan_Solar_Business_Plan.xlsx` (newer, has `Assumptions QA` sheet → canonical)

| Sheet | Cell | A | B |
|---|---|---|---|

Substantive diffs: 0 (label wording only; no numeric cell differs).

## 2. Financing deck vs workbook Executive Summary

| Metric | Deck (`bustan-financing-deck.html`) | Workbook (canonical) | Status |
|---|---|---|---|
| Installed cost per kWp (EPC example) | 17,000 (5–10 kW) · 14,500 (30–100 kW) | 11800 THB (equipment + labor) → to be updated to 17,000 / 14,500 | ✓ aligned 2026-09-04 |
| Installed cost per kWp (ESCO 500 kWp) | 14,000 (13,500–14,500 direct; ESCO all-in 15,000–17,000) | 11800 THB (equipment + labor) → to be updated | ✓ aligned 2026-09-04 |
| Sale price per kWp (Villa 10 kW) | 300K (= 30,000/kWp; 5 kW 34,000/kWp) | 32500 THB/kWp → tiered 34K/30K/24K/22K | ✓ aligned 2026-09-04 |
| Sale price per kWp (Resort 50 kW) | 1.2M (= 24,000/kWp; 100 kW 22,000/kWp) | 32500 THB/kWp → tiered | ✓ aligned 2026-09-04 |
| PPA tariff (examples) | 3.80 | 4.5 THB/kWh → 3.80 (range 3.60–3.90; ≤3.40 for ≥500 kWp) | ✓ aligned 2026-09-04 |
| PPA tariff (stated default) | 3.80 | 4.5 THB/kWh → 3.80 | ✓ aligned 2026-09-04 |
| PEA retail tariff | 3.86 avg · marginal 4.52 (res.) / 4.58 (business), ex-VAT | 6 THB/kWh average → 3.86 / 4.52 / 4.58 | ✓ aligned 2026-09-04 |
| Loan rate / term | GSB Solar for Life 3.50% yrs 1–2, 5.00% yrs 3–5, then MRR, ≤7 yr · TTB SME Solar 3.5% yrs 1–2, ≤8 yr | *Financing sheet being added to the workbook* | ✓ aligned 2026-09-04 |
| Sun hours / yield | 4.0 h/day ≈ 1,450 kWh/kWp/yr (P90 1,400) | 4.5 hours/day → 4.0 / 1,450 | ✓ aligned 2026-09-04 |
| FiT south bonus | removed (closed 2013–2015 tiers; +0.50 premium is deep-south only) | *not modeled in workbook* | ✓ aligned 2026-09-04 |
| Home tax deduction | 200,000 (Royal Decree 805; ≤10 kWp; e-Tax Invoice; not under PPA) | *not modeled in workbook* | ✓ aligned 2026-09-04 |

## 3. Workbook `Assumptions QA` (from B)

| Area | Assumption | QA status | Required action |
|---|---|---|---|
| Electricity tariff | PEA retail/base assumptions vary across materials | Needs source per scenario | Use PEA bill or current PEA/ERC tariff before investor/client use |
| Export/net-billing | Export value appears as planning assumption | Not guaranteed | Confirm PEA/ERC program and approval path per project |
| Year 1 deployment | 9.09 MW / 182 systems / 60% PPA | Aggressive | Present as upside only; add base and downside scenarios |
| Installed cost | 11,800 THB/kWp equipment/direct cost | Supplier quote needed | Tie to BOM and actual supplier RFQs |
| Sale price | 32,500 THB/kWp | Market-sensitive | Validate against proposal-builder price bands and VAT policy |
| PPA portfolio | Large retained asset portfolio | Capital constrained | Add financing, DSCR, default, insurance, and grid constraints |
| VAT/tax | Not consistently modeled | High risk | Model VAT explicitly and keep tax incentives separate unless approved |
| PEA/grid | Limited grid capacity treatment | High risk | Add PEA branch, transformer, feeder, and approval assumptions |
| Use of workbook | Business planning model | Internal planning only | Do not send to investors until sources and scenarios are added |

## 4. Decision log (Kaniel) — closed 2026-09-04 (SPEC /tmp/bustan-audit/SPEC.md)

- [x] Cost/kWp: **17,000 (5–10 kW) · 14,500 (30–100 kW) · 14,000 (500 kWp, range 13,500–14,500)** THB/kWp direct cost ex-VAT; ESCO all-in 15,000–17,000. Replaces deck 12K/20K and workbook 11,800.
- [x] Sale price: **34,000 (5 kW) · 30,000 (10 kW) · 24,000 (30–50 kW) · 22,000 (100 kW)** THB/kWp ex-VAT; 500 kWp EPC 17,000–20,000. Villa 10 kW ≈ ฿300K stays; resort 50 kW ≈ ฿1.2M (not 1.5M). Replaces workbook flat 32,500.
- [x] PPA tariff: **3.80 THB/kWh** (range 3.60–3.90 for 30–150 kW; ≤3.40 for ≥500 kWp), escalation 0–1.5%/yr, 15 years. Replaces 4.5 / 4.20 / 4.40.
- [x] Financing: **GSB Solar for Life (3.50% yrs 1–2, 3.25% secured; 5.00% yrs 3–5; then MRR; ≤7 yr; ≤฿1M) and TTB SME Solar Rooftop (3.5% yrs 1–2, ≤8 yr, up to 100%)** per SPEC; model blended 4.5–5.5% over 7–10 yr. The earlier Krungsri 10-year assumption is dropped. A Financing sheet is being added to the workbook.
