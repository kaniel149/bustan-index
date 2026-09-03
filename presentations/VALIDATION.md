# Presentations — number validation

Generated 2026-09-03 by `presentations/tools/validate_numbers.py`. **This file reports; a human decides.**

## 1. Workbook copies (cell-level diff)

- A = `bustan-index/Ko_Phangan_Solar_Business_Plan.xlsx`
- B = `bustan-energy/_retired/business/finance/Ko_Phangan_Solar_Business_Plan.xlsx` (newer, has `Assumptions QA` sheet → canonical)

| Sheet | Cell | A | B |
|---|---|---|---|
| Assumptions QA | — | `sheet missing in A` | `` |
| CapEx | A8 | `'=== EQUIPMENT ==='` | `'TOOLS / SOFTWARE'` |
| CapEx | A19 | `'=== INITIAL INVENTORY (1 month) ==='` | `'VEHICLES'` |
| Cash Flow 3yr | A2 | `'=== INFLOWS ==='` | `'OPERATING CASH FLOW'` |
| Cash Flow 3yr | A10 | `'=== OUTFLOWS ==='` | `'INVESTING / FINANCING'` |
| Dual Entity Split | A2 | `'=== YEAR 1 ==='` | `'ENTITY SPLIT'` |
| P&L 3 Years | A8 | `'=== DIRECT COSTS ==='` | `'COST OF GOODS SOLD'` |
| P&L 3 Years | A18 | `'=== OPEX ==='` | `'OPERATING EXPENSES'` |

Substantive diffs: 13 (label wording only; no numeric cell differs).

## 2. Financing deck vs workbook Executive Summary

| Metric | Deck (`bustan-financing-deck.html`) | Workbook (canonical) | Status |
|---|---|---|---|
| Installed cost per kWp (EPC example) | 12K | 11800 THB (equipment + labor) | ☐ decide |
| Installed cost per kWp (ESCO 500 kWp) | 20K | 11800 THB (equipment + labor) | ☐ decide |
| Sale price per kWp (Villa 10 kW) | 300K | 32500 THB/kWp | ☐ decide |
| Sale price per kWp (Resort 50 kW) | 1.5M | 32500 THB/kWp | ☐ decide |
| PPA tariff (examples) | 4.5 | 4.5 THB/kWh (25% discount from PEA) | ☐ decide |
| PPA tariff (stated default) | 4.20 | 4.5 THB/kWh (25% discount from PEA) | ☐ decide |
| PEA retail tariff | 6 | 6 THB/kWh average | ☐ decide |
| Loan rate / term (Krungsri) | 3.5%, 10 שנים | *not modeled in workbook* | ☐ decide |
| Sun hours (implied: 50 kWp → ฿30,375/mo @ ฿4.5) | 30,375 | 4.5 hours/day average | ☐ decide |
| FiT south bonus | 6.01-6.85 | *not modeled in workbook* | ☐ decide |
| Home tax deduction | 200,000 | *not modeled in workbook* | ☐ decide |

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

## 4. Decision log (Kaniel)

- [ ] Cost/kWp: deck ฿12K & ฿20K vs workbook 11,800 → pick one basis per system size
- [ ] Sale price: deck ฿30K/kWp examples vs workbook 32,500 → align
- [ ] PPA tariff: deck 4.5 (examples) vs 4.20 (default) vs QA retail 4.40 → one number
- [ ] Add loan/financing sheet to workbook (deck assumes 3.5%/10y Krungsri) or drop from deck
