# TM Energy Platform — Unified Operations System

## Vision
One platform. Everything TM Energy needs — from lead capture to maintenance.
Mobile-first PWA, works on iPad + phone in the field.

## Architecture
```
index.energy-tm.com/platform/
├── sales/          ← Sales App (THIS SPRINT)
├── academy/        ← Training (DONE - 17 lessons)
├── ops/            ← Operations & Installation (Phase 2)
├── monitor/        ← Monitoring & Maintenance (Phase 3)
└── admin/          ← Admin Dashboard (Phase 4)
```

## Existing Assets to Integrate
- **Proposals:** proposals/*.html (beamtech-001, kaniel-villas-001, tm-factory-001)
- **Proposal system:** proposal-system.js (tracking, signatures, options)
- **Generate engine:** generate-proposal.js (calculations)
- **Bill scanner:** bill-scanner.html (exists)
- **Roof scanner:** roof-scanner.html (exists)
- **CRM steps:** crm-step1 through crm-step10 (10 screens)
- **Academy:** academy/ (17 lessons, 4 tracks)

---

## SALES APP — Sprint 1

### User: Sales Rep on iPad/Phone

### Flow:
```
1. NEW LEAD
   └─ Capture: name, phone, email, location, source
   └─ Quick photo of roof (camera API)
   └─ Quick photo of electric bill (camera API)

2. BILL ANALYSIS
   └─ OCR scan of electricity bill
   └─ Extract: monthly kWh, peak demand, PEA rate
   └─ Show: annual cost, cost trend

3. ROOF SURVEY
   └─ Upload/take drone or roof photos
   └─ Mark roof area (draw on image)
   └─ Auto-calculate: available m², orientation, tilt
   └─ Panel layout overlay (Gemini or manual)

4. SYSTEM DESIGN
   └─ Auto-size based on consumption + roof area
   └─ Select components (panels, inverter, battery)
   └─ Show: production estimate, self-consumption ratio

5. PROPOSAL
   └─ Auto-generate proposal from design
   └─ 3 options (Essential/Professional/Premium)
   └─ Financial: payback, 25yr savings, ROI
   └─ Send via WhatsApp/email
   └─ Digital signature

6. FOLLOW-UP
   └─ Track: viewed, opened, time spent
   └─ Schedule follow-up reminders
   └─ Notes per interaction
   └─ Status: New → Contacted → Survey → Proposal → Negotiation → Won/Lost

7. SITE SURVEY (detailed)
   └─ Checklist: roof type, structure, electrical panel, meter
   └─ Photo documentation (tagged by category)
   └─ Measurements
   └─ Shading analysis
   └─ Generate survey report PDF
```

### Screens:
1. **Dashboard** — Pipeline overview, today's tasks, recent leads
2. **Lead List** — Filterable, searchable, status badges
3. **Lead Detail** — Timeline, photos, bill, design, proposal
4. **Bill Scanner** — Camera → OCR → data extraction
5. **Roof Survey** — Camera/upload → area marking → panel layout
6. **System Designer** — Component picker → auto-calculate
7. **Proposal Builder** — Preview → send → track
8. **Follow-up Calendar** — Tasks, reminders, timeline

### Tech:
- Static HTML/CSS/JS (no build step, no React)
- PWA: manifest.json + service worker for offline
- localStorage for data (Phase 1)
- Supabase for sync (Phase 2)
- Camera API for photo capture
- Canvas for roof area drawing
- Same design system as Academy (dark theme, glass cards)

### Design System:
- Navy: #0A1628
- Green: #00D68F
- Gold: #FFB800
- Glass cards, same as Academy
- Bottom navigation (mobile-first)
- Inter font
