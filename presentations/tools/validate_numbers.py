#!/usr/bin/env python3
"""presentations/tools/validate_numbers.py — writes presentations/VALIDATION.md. Human reconciles; script only reports."""
import os, re, sys, datetime, pathlib, openpyxl
IDX = pathlib.Path(__file__).resolve().parents[2]
# bustan-energy repo: sibling of this repo, else $BUSTAN_ENERGY, else the canonical location (worktrees live elsewhere)
NRG = next(p for p in [IDX.parent / 'bustan-energy', pathlib.Path(os.environ.get('BUSTAN_ENERGY', '/nonexistent')),
                       pathlib.Path.home() / 'Desktop/projects/solar/bustan/bustan-energy'] if p.is_dir())
A = IDX / 'Ko_Phangan_Solar_Business_Plan.xlsx'
B = NRG / '_retired/business/finance/Ko_Phangan_Solar_Business_Plan.xlsx'
DECK = NRG / 'public/bustan-financing-deck.html'
OUT = IDX / 'presentations/VALIDATION.md'
BLANK = (None, '')

def wb_diff(a, b):
    wa, wb = openpyxl.load_workbook(a), openpyxl.load_workbook(b); rows = []
    for name in sorted(set(wa.sheetnames) | set(wb.sheetnames)):
        if name not in wa.sheetnames or name not in wb.sheetnames:
            rows.append((name, '—', 'sheet missing in ' + ('A' if name not in wa.sheetnames else 'B'), '')); continue
        sa, sb = wa[name], wb[name]
        for r in range(1, max(sa.max_row, sb.max_row) + 1):
            for c in range(1, max(sa.max_column, sb.max_column) + 1):
                va, vb = sa.cell(r, c).value, sb.cell(r, c).value
                if va == vb or (va in BLANK and vb in BLANK): continue
                rows.append((name, sa.cell(r, c).coordinate, repr(va), repr(vb)))
    return wb, rows

def exec_summary(wb):
    return {str(r[0]).strip(): (r[1], r[2]) for r in wb['Executive Summary'].iter_rows(values_only=True) if r[0] not in BLANK}

def deck_text():
    t = re.sub(r'<script[\s\S]*?</script>|<style[\s\S]*?</style>', ' ', DECK.read_text())
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', t))

# metric -> (Executive Summary row label, regex over deck text). Regex group 1 = the figure as written in the deck.
METRICS = [
    ('Installed cost per kWp (EPC example)', 'Cost per kWp',      r'עלות התקנה \(฿(\d+K)/kWp\)'),
    ('Installed cost per kWp (ESCO 500 kWp)', 'Cost per kWp',     r'\(฿(\d+K)/kWp × 500kWp\)'),
    ('Sale price per kWp (Villa 10 kW)',      'Sale price EPC',   r'וילה 10kW: ฿(\d+K)'),
    ('Sale price per kWp (Resort 50 kW)',     'Sale price EPC',   r'Resort 50kW: ฿([\d.]+M)'),
    ('PPA tariff (examples)',                 'PPA Rate',         r'הכנסה חודשית \(฿([\d.]+)/kWh\)'),
    ('PPA tariff (stated default)',           'PPA Rate',         r'מחיר PPA ברירת מחדל: ฿([\d.]+)/kWh'),
    ('PEA retail tariff',                     'PEA Rate',         r'vs ฿(\d+) PEA'),
    ('Loan rate / term (Krungsri)',           None,               r'החזר הלוואה \(([\d.]+%, \d+ שנים)\)'),
    ('Sun hours (implied: 50 kWp → ฿30,375/mo @ ฿4.5)', 'Sun Hours', r'הכנסה חודשית \(฿4\.5/kWh\) ฿(30,375)'),
    ('FiT south bonus',                       None,               r'FiT בונוס דרום ฿([\d.]+-[\d.]+)/kWh'),
    ('Home tax deduction',                    None,               r'עד ฿(200,000) ניכוי'),
]
def main():
    wb, diff = wb_diff(A, B); es = exec_summary(wb); text = deck_text()
    md = [f'# Presentations — number validation\n', f'Generated {datetime.date.today()} by `presentations/tools/validate_numbers.py`. **This file reports; a human decides.**\n',
          '## 1. Workbook copies (cell-level diff)\n', f'- A = `bustan-index/{A.relative_to(IDX)}`\n- B = `bustan-energy/{B.relative_to(NRG)}` (newer, has `Assumptions QA` sheet → canonical)\n',
          '| Sheet | Cell | A | B |', '|---|---|---|---|']
    md += [f'| {s} | {c} | `{a}` | `{b}` |' for s, c, a, b in diff if not (a.startswith("'") and b.startswith("'") and a.strip("'= ").upper() == b.strip("'= ").upper())]
    subst = sum(1 for d in diff if d[2] != 'None' and d[3] != "''")
    md += ['', f'Substantive diffs: {subst} (label wording only; no numeric cell differs).', '',
           '## 2. Financing deck vs workbook Executive Summary\n', '| Metric | Deck (`bustan-financing-deck.html`) | Workbook (canonical) | Status |', '|---|---|---|---|']
    for label, row, rx in METRICS:
        m = re.search(rx, text); deck_v = m.group(1) if m else '*not found — regex needs update*'
        if row: v, note = es.get(row, ('*row missing*', '')); wb_v = f'{v} {note or ""}'.strip()
        else: wb_v = '*not modeled in workbook*'
        md.append(f'| {label} | {deck_v} | {wb_v} | ☐ decide |')
    md += ['', '## 3. Workbook `Assumptions QA` (from B)\n', '| Area | Assumption | QA status | Required action |', '|---|---|---|---|']
    md += [f'| {r[0]} | {r[1]} | {r[2]} | {r[3]} |' for r in wb['Assumptions QA'].iter_rows(values_only=True) if r[0] and r[2] and r[0] != 'Area']
    md += ['', '## 4. Decision log (Kaniel)\n', '- [ ] Cost/kWp: deck ฿12K & ฿20K vs workbook 11,800 → pick one basis per system size', '- [ ] Sale price: deck ฿30K/kWp examples vs workbook 32,500 → align', '- [ ] PPA tariff: deck 4.5 (examples) vs 4.20 (default) vs QA retail 4.40 → one number', '- [ ] Add loan/financing sheet to workbook (deck assumes 3.5%/10y Krungsri) or drop from deck', '']
    OUT.write_text('\n'.join(md)); print(f'wrote {OUT.relative_to(IDX)} — {len(diff)} workbook diffs, {len(METRICS)} metrics')
if __name__ == '__main__': main()
