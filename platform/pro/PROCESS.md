# TM Energy — Solar Lead Intelligence Process
## From Satellite to Signed Contract

---

## Overview

```
SATELLITE IMAGE → ROOF DETECTION → SOLAR CALCULATION → OWNER IDENTIFICATION → DECISION MAKER → OUTREACH → CONTRACT
```

**Goal:** Take any geographic area in the world, automatically identify every rooftop with solar potential, find the building owner/decision maker, and generate a personalized proposal.

**Current deployment:** Koh Phangan, Thailand (2,467+ buildings mapped)
**Scalable to:** Any location with satellite imagery

---

## PHASE 1: ROOF DETECTION & MAPPING

### 1.1 Satellite Tile Acquisition
```
INPUT:  Geographic bounding box (lat/lng)
OUTPUT: Grid of satellite tiles (zoom 17, ~1.2m/pixel)
```

**Process:**
1. Define target area bounding box
2. Calculate tile grid at zoom 17 (each tile ~300×300 meters)
3. Download tiles from satellite imagery provider
4. Skip ocean/forest tiles (no buildings)

**Sources:**
- Google Satellite tiles (free, high resolution)
- Esri World Imagery (free, good coverage)
- Maxar/Planet (paid, highest resolution)

**Output:** Library of satellite tiles covering target area

### 1.2 Building Detection (AI Vision)
```
INPUT:  Satellite tile image
OUTPUT: List of buildings [{lat, lng, roof_area, roof_type, building_type}]
```

**Process:**
1. Send tile to AI vision model (Gemini / GPT-4V / SAM)
2. Prompt: identify all buildings, estimate roof area, classify type
3. Filter: only buildings >50 sqm (commercial value)
4. Deduplicate: remove buildings within 30m of existing DB entries

**AI Prompt Template:**
```
Satellite image of [LOCATION]. For each building/rooftop visible:
1. Center coordinates (lat, lng)
2. Estimated roof area (sqm)
3. Roof type (metal/concrete/tile/flat)
4. Building type (residential/hotel/restaurant/shop/warehouse/factory)
Return JSON array. Only buildings >50 sqm.
```

**Quality Control:**
- Run detection on same tile 3 times → keep consistent results
- Compare AI count vs manual count on 10% sample
- IoU validation against known polygons

### 1.3 Solar Potential Calculation
```
INPUT:  Building (roof_area, lat/lng, roof_type)
OUTPUT: Solar specs (kWp, panels, annual_kWh, monthly_savings, grade)
```

**Formula (universal, adjust per location):**
```
usable_area = roof_area × 0.70 (70% usable after edges, obstructions)
potential_kwp = usable_area × 0.127 (127W per sqm, 580W panels)
potential_panels = floor(usable_area / 2.58) (2.58 sqm per panel)
annual_kwh = kwp × peak_sun_hours × 365 × performance_ratio
monthly_savings = (annual_kwh / 12) × electricity_rate
```

**Location Parameters:**
| Parameter | Koh Phangan | Israel | Florida | Panama |
|---|---|---|---|---|
| Peak Sun Hours | 4.2 | 5.4 | 5.0 | 4.5 |
| Performance Ratio | 0.82 | 0.80 | 0.78 | 0.80 |
| Electricity Rate | ฿6/kWh | ₪0.60/kWh | $0.13/kWh | $0.18/kWh |
| EPC Cost/Wp | ฿29 | ₪4.5 | $2.80 | $3.50 |

**Grading:**
- A (>100 kWp): Large commercial — highest priority
- B (30-100 kWp): Medium commercial — high priority
- C (5-30 kWp): Small commercial / large residential — medium
- D (<5 kWp): Small residential — low priority

### 1.4 Database Entry
```
INPUT:  Detected building with solar specs
OUTPUT: Record in Supabase `buildings` table
```

**Fields populated:**
- GPS coordinates (lat, lng)
- Roof area, type, orientation
- Solar potential (kWp, panels, annual kWh, savings)
- Grade (A/B/C/D)
- Building type
- Source: 'ai_scan'
- Status: 'identified'

---

## PHASE 2: GEOCODING & BASIC INFO

### 2.1 Reverse Geocoding
```
INPUT:  Building (lat, lng)
OUTPUT: Street address
```

**Process:**
1. Send lat/lng to Nominatim (OSM) — free, 1 req/sec
2. Parse structured address: road, district, province, postal code
3. Update building record with address

**Fallback:** Google Geocoding API ($5/1000 requests)

### 2.2 Business Name Identification
```
INPUT:  Building (lat, lng) or existing name
OUTPUT: Confirmed business name, type, basic info
```

**Sources (in order):**
1. OSM data (if tagged with name)
2. Google Places Nearby Search (lat/lng → business name, phone, website)
3. Satellite image text recognition (signage)

**Output:** name, phone, website, hours, rating, Google Maps URL

---

## PHASE 3: CONTACT ENRICHMENT

### 3.1 Website Intelligence
```
INPUT:  Business website URL
OUTPUT: Emails, phones, social media, team members
```

**Process:**
1. Fetch homepage + /contact + /about + /team pages
2. Extract with regex:
   - Emails: `[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}`
   - Phones: country-specific patterns
   - Social: facebook.com/, instagram.com/, line.me/, linkedin.com/
3. Parse team/about page for names + roles
4. Check for "Owner", "Manager", "Director", "CEO", "Founder"

### 3.2 Social Media Intelligence
```
INPUT:  Business name + location
OUTPUT: Social profiles, owner/manager name
```

**Facebook:**
- Search Pages by name + location
- Extract: page URL, phone, email, about, admin name (from responses)
- Check recent posts for owner/manager mentions

**Instagram:**
- Search by business name
- Extract: bio, contact button, linked website
- Check tagged location posts

**LinkedIn:**
- Search: "[business name] [location]"
- Find employees with title: Owner, GM, Director, Manager
- Extract: name, title, profile URL

### 3.3 Hospitality Platforms (hotels/resorts/guesthouses)
```
INPUT:  Business name + location
OUTPUT: Property manager, response rate, rating
```

**Booking.com:**
- Search by name → property page
- Extract: "managed by [name]", response rate, review highlights
- Property manager = likely decision maker

**Agoda / TripAdvisor:**
- Similar extraction
- Owner responses in reviews → owner name

---

## PHASE 4: OWNERSHIP IDENTIFICATION

### 4.1 Company Registry Lookup (country-specific)

**Thailand — DBD (datawarehouse.dbd.go.th):**
```
INPUT:  Business name
OUTPUT: Company name, registration #, directors, shareholders, capital
```
- Search by Thai or English name
- Extract: directors list (usually includes owner)
- Registered capital indicates company size
- Address may differ from physical location

**Israel — Companies Registrar (ica.justice.gov.il):**
```
INPUT:  Company name or ID
OUTPUT: Directors, shareholders, company status
```
- Search by name or חפ"ק number
- Cross-reference with Tabu (land registry) using גוש/חלקה

**USA — State Registries:**
```
INPUT:  Business name + state
OUTPUT: Registered agent, officers, filing status
```
- Florida: sunbiz.org
- Cross-reference with county property appraiser (address → owner)

**Panama — Registro Público:**
```
INPUT:  Company name
OUTPUT: Directors, registered agent
```

### 4.2 Property Ownership (land/building)
```
INPUT:  Address or cadastral reference
OUTPUT: Property owner name
```

- Thailand: Land Department (physical visit, not online)
- Israel: Tabu via gush/helka online
- USA: County property appraiser websites (usually free)
- Panama: Registro Público

### 4.3 AI-Powered Owner Research
```
INPUT:  Business name + location + all gathered data
OUTPUT: Most likely owner/operator
```

**Process:**
1. Aggregate all data from previous layers
2. Send to LLM with prompt:
```
Given this information about [business]:
- Name: [name]
- Type: [type]
- Location: [address]
- Website: [url]
- Phone: [phone]
- Company registration: [if found]
- Directors: [if found]
- LinkedIn profiles: [if found]
- Booking.com manager: [if found]

Who is most likely the decision maker for installing solar panels on this building?
Provide: name, role, confidence level (high/medium/low), best contact method.
```

---

## PHASE 5: DECISION MAKER MAPPING

### 5.1 DM Identification Rules
```
INPUT:  Building type + ownership data + contacts
OUTPUT: Decision maker name, role, contact channel
```

| Building Type | Decision Maker | How to Find | Best Channel |
|---|---|---|---|
| Villa (owner-occupied) | Owner | Property records, Google | WhatsApp / Walk-in |
| Villa (rented) | Landlord | Property records, agent | Email / Phone |
| Hotel (independent) | Owner or GM | Booking.com, LinkedIn | Email / Meeting |
| Hotel (chain) | Regional Engineering Dir | LinkedIn, corporate site | Email |
| Resort | GM | Booking.com, website | Email / Visit |
| Guesthouse/Hostel | Owner (usually on-site) | Google, Booking | Walk-in / WhatsApp |
| Restaurant/Bar | Owner | DBD, Facebook | Walk-in / FB DM |
| Shop/Retail | Owner | DBD, Google | Walk-in |
| Factory/Warehouse | Operations Manager | LinkedIn, DBD directors | Email / Phone |
| Office building | Property management | Building directory, Google | Email / Phone |
| School | Director/Principal | School website | Email / Formal letter |
| Hospital | Facilities Director | Website, LinkedIn | Email / Formal |
| Government | Department Head | LAO office | Formal letter |

### 5.2 Lead Scoring
```
INPUT:  All enriched data
OUTPUT: Score 0-100, Grade A/B/C/D, recommended action
```

**Scoring Matrix:**
```
Contact Quality (max 50):
  Has DM name + direct contact: 50
  Has phone (general): 25
  Has email (general): 20
  Has website only: 10
  Has name only: 5

Business Value (max 30):
  Monthly bill >฿100K: 30
  Monthly bill ฿50-100K: 20
  Monthly bill ฿20-50K: 15
  Monthly bill <฿20K: 5

Roof Quality (max 20):
  Grade A (>100 kWp): 20
  Grade B (30-100 kWp): 15
  Grade C (5-30 kWp): 10
  Grade D (<5 kWp): 5
```

**Grade Assignment:**
- A (80-100): Hot lead — DM known, high value, ready for outreach
- B (50-79): Warm lead — partial info, needs more research or cold approach
- C (20-49): Cool lead — basic info, add to nurture list
- D (0-19): Cold — no actionable data, low priority

---

## PHASE 6: OUTREACH PREPARATION

### 6.1 Personalized Pitch Generation
```
INPUT:  Enriched building + DM info
OUTPUT: Customized outreach message
```

**Template Variables:**
- {dm_name} — Decision maker name
- {business_name} — Business name
- {building_type} — Type description
- {system_size} — Recommended kWp
- {monthly_savings} — Estimated THB savings
- {payback} — Years to payback
- {model} — Recommended deal (Purchase/PPA/Lease)

**Outreach Templates by Channel:**
- WhatsApp: Short, personal, Thai+English
- Email: Professional, detailed, with proposal link
- Walk-in: Conversation script with leave-behind
- Facebook DM: Casual, community-focused

### 6.2 Proposal Auto-Generation
```
INPUT:  Building data + selected deal model
OUTPUT: Branded HTML proposal (TM Energy format)
```

- Uses existing TM Energy proposal templates
- Auto-fills: system specs, financials, ROI
- 3 options: EPC Purchase, PPA, Lease
- Digital signature capability
- WhatsApp share link

---

## MEASUREMENT & ITERATION

### Success Metrics
```
Roof Detection Accuracy:
  - Buildings found vs actual: target >90%
  - Polygon accuracy (IoU): target >80%
  - False positive rate: target <10%

Enrichment Quality:
  - Buildings with phone: target >60%
  - Buildings with DM name: target >40%
  - Correct DM identification: target >70%

Sales Funnel:
  - Identified → Contacted: target 30%
  - Contacted → Survey: target 20%
  - Survey → Proposal: target 50%
  - Proposal → Won: target 25%
  - Overall conversion: 0.75%
```

### Autoresearch Improvement Loop
```
Every night:
  1. Sample 20 buildings from today's scan
  2. Manually verify: is the building real? Is the polygon correct?
  3. If accuracy <90%: adjust AI prompts, retrain
  4. If accuracy >90%: expand to next area
  5. Log results → track improvement over time
```

---

## TECHNOLOGY STACK

| Component | Tool | Cost |
|---|---|---|
| Satellite imagery | Google tiles | Free |
| Building detection | Gemini 2.0 Flash | ~$0.01/tile |
| Geocoding | OSM Nominatim | Free |
| Business lookup | Google Places API | $17/1000 |
| Website scraping | Node.js fetch | Free |
| Company registry | Country-specific APIs | Free-$$ |
| Database | Supabase | Free (up to 500MB) |
| AI enrichment | Gemini / Claude | ~$0.005/building |
| Proposal generation | Static HTML | Free |
| Map visualization | Leaflet + OpenStreetMap | Free |

**Estimated cost per location (2,500 buildings):**
- Without Google Places: ~$25 (Gemini API only)
- With Google Places: ~$70 (Gemini + Places)
- Full enrichment: ~$100 (all layers)

---

## SCALING TO NEW MARKETS

### Adding a New Location
1. **Define bounding box** — lat/lng of target area
2. **Set location parameters** — peak sun hours, electricity rate, EPC cost
3. **Run Phase 1** — satellite scan + building detection
4. **Configure country adapter** — company registry API for ownership lookup
5. **Run Phases 2-5** — enrichment pipeline
6. **Launch platform** — deploy KP Solar Pro with new data

### Time to Deploy New Location
- Phase 1 (scan): 2-4 hours (automated)
- Phase 2 (geocoding): 1-2 hours (automated)
- Phase 3 (enrichment): 4-8 hours (automated)
- Phase 4 (ownership): 2-4 hours (semi-automated)
- Phase 5 (DM mapping): 1-2 hours (automated)
- Platform setup: 1 hour (clone + configure)

**Total: 1-2 days per new location (mostly automated)**

---

*TM Energy — From Satellite to Contract*
*Built March 2026, Koh Phangan, Thailand*
