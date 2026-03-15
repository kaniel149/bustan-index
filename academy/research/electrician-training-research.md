# TM Energy Academy — Electrician Training Research Document

> **Compiled:** 2026-03-15  
> **Purpose:** Technical training content for electricians working on solar PV and EV charging installations in Thailand  
> **Standards basis:** IEC 62548, IEC 62446, IEC 61215, IEC 61730, EIT (Thailand), PEA/MEA regulations  
> **Note:** Thailand-specific regulatory details (PEA/MEA forms, ERC licensing fees) should be verified against current government publications as these change periodically. All electrical specifications are based on established international standards.

---

## Table of Contents

1. [Solar PV Installation — Step by Step](#1-solar-pv-installation--step-by-step)
2. [Electrical Wiring & Connections](#2-electrical-wiring--connections)
3. [Safety & Testing Procedures](#3-safety--testing-procedures)
4. [Thailand-Specific Electrical Standards](#4-thailand-specific-electrical-standards)
5. [EV Charger Installation](#5-ev-charger-installation)
6. [Inverter Configuration & Commissioning](#6-inverter-configuration--commissioning)
7. [Troubleshooting & Maintenance](#7-troubleshooting--maintenance)
8. [Battery Storage Installation](#8-battery-storage-installation)

---

## 1. Solar PV Installation — Step by Step

### 1.1 Pre-Installation Planning

#### Site Survey Checklist
1. **Roof assessment**
   - Structural integrity — roof must support ≥15 kg/m² additional load (panels + mounting)
   - Roof material: concrete deck, metal sheet, tile — each requires different mounting method
   - Roof orientation and tilt angle (Thailand optimal: 10°–15° south-facing due to near-equator latitude)
   - Shading analysis — use Solar Pathfinder or app-based tools (e.g., SunSurveyor)
   - Available roof area measurement (m²)

2. **Electrical assessment**
   - Existing main breaker capacity (A)
   - Distribution board available slots
   - Distance from array to inverter location
   - Distance from inverter to distribution board
   - Existing grounding/earthing system condition
   - Utility meter type and connection (single-phase or three-phase)

3. **System design**
   - Calculate required capacity (kWp) based on customer electricity consumption
   - Panel selection — wattage, dimensions, Voc, Isc, Vmp, Imp values
   - String sizing — match to inverter MPPT voltage window
   - Inverter selection — match to total array capacity

#### Tools Required for Site Survey
- Tape measure (30m minimum)
- Inclinometer / angle finder
- Compass or compass app
- Digital multimeter
- Clamp meter
- Camera for documentation
- Ladder / roof access equipment
- PPE: hard hat, safety harness, non-slip shoes

### 1.2 Mounting System Installation

#### Concrete Flat Roof (Most common in Thailand commercial)

1. **Layout marking**
   - Mark rail positions on roof using chalk line
   - Maintain minimum 500mm setback from roof edges
   - Plan row spacing to avoid inter-row shading (minimum 1.5× panel height for Thailand latitude)

2. **Ballast or anchor installation**
   - **Ballasted systems:** Place concrete blocks at calculated intervals (wind load dependent)
   - **Anchored systems:** Drill into concrete deck, install chemical anchors or expansion bolts
   - ⚠️ **WARNING:** Verify waterproof membrane is not punctured. Use flashing/sealant at all penetration points.

3. **Rail installation**
   - Install aluminum mounting rails (typically 40×40mm or 40×60mm profile)
   - Level rails using adjustable tilt legs or feet
   - Torque all bolts to manufacturer specification (typically 18–22 Nm for M8 bolts)
   - Install rail splices where rails need to be extended — minimum 200mm overlap

4. **Panel mounting**
   - Slide mid-clamps and end-clamps onto rails
   - Place panels onto rails, one at a time
   - Secure with mid-clamps (between panels) and end-clamps (at array edges)
   - Torque clamps to specification (typically 10–12 Nm)
   - Ensure 10–20mm gap between panels for thermal expansion and ventilation

#### Metal Roof (Standing seam / corrugated)

1. **Standing seam:** Use non-penetrating S-5! or similar clamps that grip the seam
2. **Corrugated metal:** Use L-brackets with EPDM rubber washers, screwed into roof purlins
   - ⚠️ **WARNING:** Never screw into unsupported sheet metal — always hit structural members (purlins)
3. Mount rails to brackets, then panels to rails as above

#### Tile Roof (Common in Thai residential)

1. Remove tiles at mounting point locations
2. Install tile replacement brackets (stainless steel or aluminum)
3. Secure brackets to roof rafters with lag bolts
4. Replace surrounding tiles, ensuring waterproof seal
5. Mount rails to brackets, then panels to rails

### 1.3 MC4 Connector Wiring — Series and Parallel

#### Series Connection (Increases Voltage)
- Connect the MC4 positive (+) of Panel 1 to the MC4 negative (−) of Panel 2
- Result: Voltages add, current stays same
- Example: 3 panels × 40V Voc = 120V Voc string voltage
- **Use for:** String inverters — build strings to match inverter MPPT voltage window

#### Parallel Connection (Increases Current)
- Connect all positives (+) together using MC4 Y-branch or T-branch connectors
- Connect all negatives (−) together using MC4 Y-branch or T-branch connectors
- Result: Currents add, voltage stays same
- **Use for:** Connecting multiple strings to same MPPT input

#### MC4 Connector Assembly

**Tools required:**
- MC4 crimping tool (dedicated — do NOT use generic crimpers)
- MC4 assembly/disassembly wrench (spanner)
- Wire stripper for 4mm² / 6mm² solar cable
- Cable cutter

**Procedure:**
1. Cut solar cable to required length
2. Strip insulation — 8mm exposed conductor
3. Insert stripped conductor into MC4 metal contact pin/socket
4. Crimp using MC4 crimping tool — verify firm connection by pulling
5. Insert crimped contact into MC4 housing — listen for click
6. Thread cable gland nut over cable before insertion
7. Tighten cable gland nut to achieve IP67 seal

⚠️ **CRITICAL SAFETY:**
- Never connect/disconnect MC4 connectors under load (arc risk)
- Always verify polarity before connecting strings
- Use only matching MC4 brands — cross-brand connections void IP67 rating and are a fire hazard
- All MC4 connections should be accessible for inspection — never bury in walls

### 1.4 Cable Management

1. Route DC cables along mounting rails using cable clips (UV-resistant)
2. Bundle cables with UV-resistant cable ties (nylon 6/6 black, rated for outdoor use)
3. Use cable tray or conduit for vertical runs from roof to inverter
4. Maintain minimum bend radius: 4× cable diameter for solar cable
5. Ensure physical separation between DC and AC cabling (minimum 50mm spacing or separate conduit)
6. Label all cables at both ends: string number, polarity, voltage

### 1.5 Installation Flow Summary

```
Site Survey → System Design → Permit Application (PEA/MEA)
     ↓
Material Delivery & Inspection
     ↓
Mounting System Installation (Roof)
     ↓
Panel Installation & Clamping
     ↓
DC Wiring (MC4 connections, string cabling)
     ↓
Inverter Mounting (indoor/outdoor rated location)
     ↓
DC Connection to Inverter (with DC isolator)
     ↓
AC Connection to Distribution Board (with AC breaker)
     ↓
Grounding/Earthing System
     ↓
Testing & Commissioning
     ↓
PEA/MEA Inspection & Meter Installation
     ↓
System Handover to Customer
```

---

## 2. Electrical Wiring & Connections

### 2.1 DC Wiring Standards (per IEC 62548)

#### Solar DC Cable Specifications

| Parameter | Requirement |
|-----------|------------|
| Cable type | Solar-rated, double-insulated (H1Z2Z2-K or equivalent) |
| Conductor | Tinned copper |
| Insulation | Cross-linked polyolefin (XLPO) or XLPE |
| UV resistance | Required — EN 50618 / TÜV certified |
| Temperature rating | -40°C to +90°C (120°C at conductor) |
| Voltage rating | 1000V DC or 1500V DC |
| Fire rating | Flame retardant, halogen-free preferred |
| IP rating at connections | IP67 minimum (with MC4 connectors) |

#### DC Cable Sizing Table

| System Size | String Isc | Recommended Cable Size | Max Run Length (3% drop) |
|-------------|-----------|----------------------|------------------------|
| ≤3 kWp | ≤10A | 4 mm² | Up to 30m |
| 3–10 kWp | 10–15A | 6 mm² | Up to 40m |
| 10–30 kWp | 15–20A | 6 mm² or 10 mm² | Up to 50m |
| 30–100 kWp | Per string design | 6–10 mm² per string | Calculate per run |

**Cable sizing formula:**
```
Cable size (mm²) = (2 × L × I) / (ΔV × κ)

Where:
L = cable length one way (m)
I = maximum current — use Isc × 1.25 (A)
ΔV = allowable voltage drop (V) — typically 3% of Vmp
κ = conductivity of copper = 56 m/(Ω·mm²)
```

#### DC Color Codes

| Conductor | Color (IEC/Thailand) |
|-----------|---------------------|
| DC Positive (+) | Red |
| DC Negative (−) | Black |
| Earth/Ground | Green-Yellow |

### 2.2 AC Wiring — Inverter to Distribution Board

#### AC Cable Specifications

| System | Connection | Cable Type | Typical Size |
|--------|-----------|-----------|-------------|
| Single-phase ≤5kW | Inverter to DB | NYY or VCT (Thailand) | 2×4 mm² + E |
| Single-phase 5–10kW | Inverter to DB | NYY | 2×6 mm² + E |
| Three-phase ≤15kW | Inverter to DB | NYY | 4×4 mm² + E |
| Three-phase 15–30kW | Inverter to DB | NYY | 4×6 mm² + E |
| Three-phase 30–60kW | Inverter to DB | NYY | 4×16 mm² + E |
| Three-phase 60–100kW | Inverter to DB | NYY | 4×35 mm² + E |

> 🇹🇭 **Thailand Note:** Common cable types are THW (single conductor in conduit), NYY (multi-core armored), and VCT (flexible multi-core). For permanent installation, NYY or THW in conduit is preferred per EIT standards.

#### AC Color Codes (Thailand / IEC)

| Conductor | Color |
|-----------|-------|
| Line 1 (L1) | Brown |
| Line 2 (L2) | Black |
| Line 3 (L3) | Grey |
| Neutral (N) | Blue |
| Earth (PE) | Green-Yellow |

> 🇹🇭 **Thailand Note:** Older Thai installations may use Red/Yellow/Blue for L1/L2/L3. New installations should follow IEC color code (Brown/Black/Grey). Always verify with existing installation before connecting.

#### AC Connection Procedure

1. **Install AC isolator/breaker** at inverter output — rated ≥1.25 × inverter max AC output current
2. Route AC cable from inverter to distribution board via conduit or cable tray
3. **Install dedicated solar breaker** in distribution board:
   - Size = inverter max output current × 1.25, rounded up to standard breaker size
   - Must be clearly labeled "SOLAR PV SUPPLY"
   - Connect on load side of main breaker (below main switch)
4. Connect L, N, E conductors — torque terminal screws to manufacturer specification
5. ⚠️ **WARNING:** Solar breaker must NOT be connected above (supply side of) the main breaker — this creates backfeed risk to utility workers

### 2.3 Grounding / Earthing System

#### Requirements (IEC 62548 + Thailand EIT)

1. **Equipment grounding:**
   - All metallic frames (panels, rails, mounting structures) must be bonded to earth
   - Use 6 mm² minimum green-yellow copper conductor
   - Use stainless steel grounding lugs with serrated washers (to cut through anodized aluminum)
   - Bond every panel frame — or use grounding clips with WEEB (Washer, Electrical Equipment Bond) at each clamp

2. **Inverter grounding:**
   - Connect inverter chassis earth terminal to main earth bar
   - Use 6 mm² minimum green-yellow conductor (10 mm² for systems >10 kWp)

3. **Earth electrode:**
   - Copper-clad ground rod: 16mm diameter × 2.4m minimum length
   - Drive into ground near inverter location
   - Earth resistance must be ≤5Ω (Thailand EIT standard)
   - If >5Ω, add parallel rods at minimum 2.4m spacing, or use ground enhancement compound

4. **Lightning protection:**
   - Install surge protection devices (SPD) Type 2 on both DC and AC sides
   - DC SPD: Install at inverter DC input, rated for system Voc × 1.2
   - AC SPD: Install at distribution board, rated for 230/400V system

#### Grounding Connection Sequence
```
Panel Frames → Mounting Rails → Ground Bus Bar → Main Earth Bar → Earth Electrode
                                                       ↑
Inverter Chassis ────────────────────────────────────────┘
```

### 2.4 Protection Devices

| Device | Location | Rating Guideline |
|--------|----------|-----------------|
| DC Isolator (Rotary) | Between array and inverter | Vdc ≥ string Voc × 1.2, Idc ≥ string Isc × 1.25 |
| DC Fuses (if needed) | Per string, before combiner | 1.5 × Isc ≤ fuse ≤ 2.4 × Isc |
| DC SPD Type 2 | At inverter DC input | Uc ≥ Voc × 1.2 |
| AC Breaker (MCB) | At inverter AC output | 1.25 × max AC output current |
| AC SPD Type 2 | At distribution board | Un = 230/400V |
| RCD/RCBO | If required by local code | 30mA Type A or Type B (for inverters without transformer) |
| Main Earth Bar | Central grounding point | Connected to earth electrode |

⚠️ **CRITICAL:** Huawei SUN2000 inverters are transformerless — if local code requires RCD protection, use **Type B RCD** (sensitive to DC fault currents). Type A or Type AC RCDs may not detect DC leakage faults from transformerless inverters.

---

## 3. Safety & Testing Procedures

### 3.1 Pre-Commissioning Safety Checks

Before any electrical testing:

1. ⚠️ Verify all DC isolators are OFF
2. ⚠️ Verify AC breaker feeding inverter is OFF
3. ⚠️ Confirm all MC4 connections are fully seated and locked
4. Put on appropriate PPE: insulated gloves (1000V rated), safety glasses
5. Inform all personnel of testing activities
6. Post warning signs: "DANGER — SOLAR PV SYSTEM — DC VOLTAGE PRESENT EVEN WHEN ISOLATED"

### 3.2 Commissioning Test Checklist (per IEC 62446-1)

#### Visual Inspection

| Check Item | Pass Criteria |
|-----------|--------------|
| Modules correctly secured | All clamps torqued, no movement |
| No visible module damage | No cracks, chips, delamination, discoloration |
| Cable management | Secured, no chafing, proper bend radius |
| MC4 connections | Fully engaged, correct polarity |
| DC isolator installed and accessible | Within 2m of inverter or at array |
| AC breaker installed and labeled | Clearly marked "SOLAR PV" |
| Earthing connections | Tight, corrosion-free, green-yellow cable |
| SPD installed | DC and AC sides |
| Labels and signage | DC warning at inverter, DB, and meter |
| Cable penetration seals | Weatherproof, no gaps |

#### Electrical Tests

### 3.3 Open Circuit Voltage (Voc) Test

**Purpose:** Verify string wiring and polarity  
**Tools:** Digital multimeter (DC, rated ≥1000V)

**Procedure:**
1. Ensure DC isolator is OFF
2. Set multimeter to DC Voltage (V⎓)
3. Connect probes to string positive and negative cables at inverter end
4. Read voltage

**Expected result:**
```
Expected Voc = Panel Voc (at STC) × number of panels in string × temperature correction factor

Temperature correction:
- Thailand ambient typically 30–40°C
- Cell temperature typically 50–70°C during operation
- Voc decreases ~0.3%/°C above 25°C for mono/poly-Si
- At 50°C cell temp: Voc ≈ Voc(STC) × 0.925
```

**Pass criteria:**
- Voltage is positive (polarity correct)
- Measured Voc within ±5% of calculated value
- All strings within ±2% of each other

⚠️ **If voltage is negative:** String polarity is reversed — trace and correct before proceeding

### 3.4 Short Circuit Current (Isc) Test

**Purpose:** Verify string current output  
**Tools:** DC clamp meter rated ≥20A DC, or multimeter with 10A+ DC current range

**Procedure:**
1. Ensure string is disconnected from inverter
2. Use clamp meter around one conductor (preferred — non-contact)
3. Alternatively: connect multimeter in series (ammeter mode) — ⚠️ brief measurement only (<5 seconds)
4. Read current

**Expected result:**
```
Expected Isc = Panel Isc (at STC) × irradiance correction

At 1000 W/m² (STC): use nameplate Isc
At 800 W/m²: Isc ≈ nameplate × 0.8
At 600 W/m²: Isc ≈ nameplate × 0.6
```

**Pass criteria:**
- Current is positive (correct polarity)
- Measured Isc within ±10% of irradiance-corrected expected value
- All strings within ±5% of each other

### 3.5 Insulation Resistance Test

**Purpose:** Verify DC cable insulation integrity — detect damaged cables, moisture ingress  
**Tools:** Insulation resistance tester (Megger) — rated ≥1000V DC test voltage

**Procedure:**
1. Disconnect all strings from inverter
2. Short-circuit string positive and negative together at array end
3. Connect Megger between shorted conductors and earth (mounting structure)
4. Apply test voltage:
   - Systems ≤600V: apply 500V DC test voltage
   - Systems 600–1000V: apply 1000V DC test voltage
   - Systems >1000V: apply 1500V DC test voltage (if tester supports)
5. Hold for 60 seconds, record reading
6. Repeat for each string

**Pass criteria:**

| System Voltage | Minimum Insulation Resistance |
|---------------|------------------------------|
| ≤120V | ≥0.5 MΩ |
| 120–600V | ≥1.0 MΩ |
| 600–1000V | ≥1.0 MΩ |

⚠️ **WARNING:** Insulation resistance testing applies HIGH VOLTAGE. Ensure no one is touching the system during test. Post warning signs.

### 3.6 Earth Continuity Test

**Purpose:** Verify all exposed metalwork is properly bonded to earth  
**Tools:** Low-resistance ohmmeter (earth bond tester) or multimeter in Ω mode

**Procedure:**
1. Connect one lead to main earth bar
2. Touch other lead to each metallic component:
   - Each panel frame
   - Each mounting rail
   - Inverter chassis
   - Any metal conduit or enclosure
3. Record resistance

**Pass criteria:**
- Resistance ≤1Ω from any point to main earth bar
- For long runs (>30m), ≤2Ω acceptable

### 3.7 Earth Electrode Resistance Test

**Purpose:** Verify ground rod provides adequate earth connection  
**Tools:** Earth resistance tester (3-point or clamp-on method)

**Procedure (3-point fall-of-potential method):**
1. Disconnect earth electrode from system
2. Drive two temporary test stakes in a line away from electrode
   - Current stake: 30–50m from electrode
   - Potential stake: 62% of distance to current stake (~20–30m)
3. Connect tester leads
4. Read resistance

**Pass criteria:**
- ≤5Ω (Thailand EIT standard)
- ≤2Ω preferred for PV systems
- If >5Ω: add parallel rods, use ground enhancement material, or extend rod depth

### 3.8 IV Curve Testing (Advanced)

**Purpose:** Verify panel performance matches manufacturer datasheet  
**Tools:** IV curve tracer (e.g., Solmetric PVA-1500, HT I-V400, Seaward Solar Survey)

**Procedure:**
1. Disconnect string from inverter
2. Connect IV tracer to string positive and negative
3. Measure irradiance and module temperature simultaneously
4. Trigger IV curve sweep
5. Software translates measured curve to STC conditions

**Pass criteria:**
- Pmax within ±5% of nameplate (at STC equivalent)
- Fill factor >70% (typical for crystalline silicon)
- No steps, notches, or unusual shapes in IV curve (indicates bypass diode issues, shading, or cell damage)

### 3.9 Thermal Imaging / Hot Spot Detection

**Purpose:** Detect cell defects, poor connections, bypass diode failures  
**Tools:** Infrared thermal camera (resolution ≥160×120, thermal sensitivity ≤0.1°C)

**Procedure:**
1. System must be operating under load (sunny conditions, inverter running)
2. Scan all panels systematically from front
3. Look for hot spots: individual cells or groups significantly warmer than surroundings
4. Document with thermal images — note panel position and temperature delta

**Pass criteria:**
- ΔT (hot spot vs. average cell) <10°C: Monitor
- ΔT 10–20°C: Investigate, schedule replacement
- ΔT >20°C: ⚠️ Immediate attention — fire risk, replace panel

### 3.10 Commissioning Test Record

Document and retain:
- Date of commissioning
- System details (kWp, number of panels, inverter model)
- All test results in table format
- Installer name and license number
- Serial numbers of all major components
- Photos of installation, labels, and test equipment

---

## 4. Thailand-Specific Electrical Standards

### 4.1 Engineering Institute of Thailand (EIT) Standards

> 🇹🇭 The EIT (วิศวกรรมสถานแห่งประเทศไทย, วสท.) publishes Thailand's primary electrical installation standard, equivalent to IEC 60364 / BS 7671.

#### Key EIT Requirements for Solar PV

| Requirement | EIT Standard |
|------------|-------------|
| Maximum earth resistance | ≤5Ω |
| Minimum conductor size (power) | 2.5 mm² (lighting), 4 mm² (power circuits) |
| RCD protection | Required for socket outlets, 30mA |
| Voltage drop limit | ≤5% from meter to furthest point |
| Conduit fill ratio | ≤40% of conduit cross-section area |
| Cable installation in conduit | PVC conduit (yellow for power, grey for communication) |
| Grounding conductor minimum | 6 mm² copper or 16 mm² aluminum |
| Main switch requirement | Every installation must have a main disconnect |

### 4.2 PEA Solar Rooftop Connection Requirements

> 🇹🇭 **PEA** (การไฟฟ้าส่วนภูมิภาค) — Provincial Electricity Authority covers all areas outside Bangkok

#### Connection Process for Solar Rooftop

**Step 1: Apply for Connection**
- Submit application to local PEA office
- Required documents:
  - Copy of electricity bill (showing meter number)
  - Copy of ID card and house registration (ทะเบียนบ้าน)
  - Site plan / single-line diagram (SLD) — signed by licensed engineer
  - Equipment specifications (panels, inverter — must be on PEA approved list)
  - Building permit (if required for structural modifications)
  - Copy of installer's ERC license

**Step 2: PEA Review & Approval**
- PEA reviews application (typically 15–30 working days)
- May request site inspection
- Issues connection agreement

**Step 3: Installation**
- Install system per approved design
- System must include:
  - Anti-islanding protection (built into grid-tied inverters)
  - AC disconnect switch accessible to PEA
  - Over/under voltage protection
  - Over/under frequency protection
  - DC isolator

**Step 4: PEA Inspection**
- PEA sends inspector to verify installation
- Checks: SLD matches actual, safety devices present, grounding adequate
- Issues approval certificate

**Step 5: Meter Installation**
- PEA installs bidirectional (import/export) meter
- Net metering or feed-in tariff as per current policy

#### PEA-Approved Inverter Requirements
- Must have anti-islanding per IEC 62116 or equivalent
- Must disconnect within 2 seconds of grid loss
- Frequency range: 49–51 Hz (Thailand grid frequency: 50 Hz)
- Voltage range: ±10% of nominal (single-phase: 207–253V, three-phase: 360–440V)
- Power factor: >0.9
- Total harmonic distortion (THD): <5%
- Must appear on PEA approved equipment list

### 4.3 MEA Solar Connection (Bangkok area)

> 🇹🇭 **MEA** (การไฟฟ้านครหลวง) — Metropolitan Electricity Authority covers Bangkok, Nonthaburi, and Samut Prakan

Process is similar to PEA with some differences:
- Application through MEA website or local office
- MEA has its own approved equipment list
- Inspection may be more stringent in Bangkok
- Separate application forms from PEA

### 4.4 ERC Licensing Requirements

> 🇹🇭 **ERC** (คณะกรรมการกำกับกิจการพลังงาน) — Energy Regulatory Commission

#### Who Needs an ERC License?

| System Size | License Required? | Type |
|-------------|------------------|------|
| ≤200 kVA self-consumption | Exempted (แจ้งยกเว้น) | Notification only |
| >200 kVA – 1,000 kVA | Exempted with notification | Must notify ERC |
| >1,000 kVA | Full license required | Apply to ERC |
| Any size selling to grid | Registration required | Apply through PEA/MEA + ERC |

#### For Typical Rooftop Solar (<200 kVA)
- No ERC production license needed for self-consumption
- If selling excess to grid: register as Very Small Power Producer (VSPP) with ERC
- VSPP application through utility (PEA/MEA) who coordinates with ERC

### 4.5 Professional License Requirements

| Role | License Required | Issuing Body |
|------|-----------------|-------------|
| System designer (>100 kVA) | Professional engineer license (วศ.ชำนาญการ) | Council of Engineers Thailand (สภาวิศวกร) |
| System designer (≤100 kVA) | Associate engineer or technician license | Council of Engineers Thailand |
| Installer | ERC installer certification | ERC (อบรมและสอบ) |
| Electrician | Skilled electrician certificate (ช่างไฟฟ้า) | Department of Skill Development |

### 4.6 Thailand Grid Specifications

| Parameter | Value |
|-----------|-------|
| Grid voltage (single-phase) | 230V ±10% (207–253V) |
| Grid voltage (three-phase) | 400V ±10% (360–440V) |
| Grid frequency | 50 Hz ±1% |
| Residential supply | Single-phase 230V, 15A (3.5kVA) or 30A (7kVA) |
| Small commercial | Three-phase 400V, various capacities |
| Power factor requirement | ≥0.85 (PEA), ≥0.9 for solar injection |

### 4.7 Thailand Climate Considerations for Solar

| Factor | Impact on Installation |
|--------|----------------------|
| High ambient temperature (30–40°C) | Use temperature derating for cables and inverters; ensure ventilation |
| High humidity (60–90%) | Use IP65+ rated equipment; ensure cable glands are sealed |
| Monsoon season (May–Oct) | Schedule roof work in dry season; waterproof all penetrations |
| UV intensity (high year-round) | Use only UV-rated cables and cable ties; inspect annually |
| Lightning frequency (high) | SPD installation is critical; consider lightning rods for exposed arrays |
| Dust and pollution | Plan for regular panel cleaning; affects yield by 5–15% |

---

## 5. EV Charger Installation

### 5.1 EV Charger Types

| Type | Power | Connector | Use Case |
|------|-------|-----------|----------|
| **AC Level 1** (Mode 2) | 2.3 kW (10A, 230V) | Type A socket + EVSE cable | Emergency/portable only |
| **AC Level 2** (Mode 3) | 3.7–22 kW | Type 2 (IEC 62196) | Home, workplace, destination |
| **DC Fast** (Mode 4) | 25–350 kW | CCS2 / CHAdeMO | Public, highway, fleet |

#### Common Charger Specifications for Thailand Market

| Charger | Power | Input | Cable | Notes |
|---------|-------|-------|-------|-------|
| 7.4 kW AC (single-phase) | 32A × 230V | Single-phase | 6–10 mm² | Most common home charger |
| 11 kW AC (three-phase) | 16A × 400V × 3 | Three-phase | 4 mm² per phase | Workplace, small commercial |
| 22 kW AC (three-phase) | 32A × 400V × 3 | Three-phase | 6–10 mm² per phase | Commercial, destination |
| 60 kW DC | ~90A × ~200–750V DC | Three-phase 400V | Dedicated supply | Public fast charging |
| 120 kW DC | ~180A × ~200–750V DC | Three-phase 400V | Dedicated supply | Highway charging |

### 5.2 Electrical Requirements

#### For 7.4 kW Single-Phase Home Charger

**Supply requirements:**
- Dedicated circuit from distribution board
- Cable: 2×6 mm² + E (NYY or THW in conduit) for runs up to 25m
- Cable: 2×10 mm² + E for runs 25–40m
- MCB: 40A Type C (or per charger manufacturer)
- RCD: 30mA Type A minimum (Type B recommended, or charger with built-in DC 6mA detection)
- Earthing: Dedicated earth conductor to main earth bar

#### For 22 kW Three-Phase Commercial Charger

**Supply requirements:**
- Dedicated circuit from main distribution board or sub-DB
- Cable: 4×6 mm² + E (NYY) for runs up to 25m
- Cable: 4×10 mm² + E for runs 25–40m
- MCCB/MCB: 40A 4-pole Type C
- RCD: 30mA Type B (required for three-phase EV charging)
- Earthing: Dedicated earth conductor, 10 mm² minimum

#### For 60 kW DC Fast Charger

**Supply requirements:**
- Dedicated supply from utility transformer or main switchboard
- Cable: Calculated per specific charger requirements (typically 4×35 mm² + E or larger)
- MCCB: 100A 4-pole
- Dedicated earthing system
- May require utility supply upgrade
- Ventilation for charger cabinet (forced air or natural convection as per spec)

### 5.3 EV Charger Installation Procedure

#### Step 1: Site Assessment
1. Verify available electrical capacity (kVA from utility)
2. Check distance from distribution board to charger location
3. Assess cable routing — underground, surface, or overhead
4. Verify earthing system adequacy
5. For DC chargers: check ventilation requirements, concrete pad requirements

#### Step 2: Electrical Preparation
1. Install dedicated circuit breaker in distribution board
2. Route cable from DB to charger location via conduit or cable tray
3. For outdoor runs: use IP65 conduit or direct-burial rated cable
4. Install RCD protection (if not built into charger)
5. Verify earth continuity from charger location to main earth

#### Step 3: Charger Mounting
1. Mount charger on wall (wall-mount) or pedestal (floor-mount)
   - Wall: use appropriate anchors for wall material (concrete: M10 expansion bolts)
   - Pedestal: secure to concrete foundation with anchor bolts
2. Height: cable connector should be 750–1200mm from ground
3. Ensure charger is level and secure
4. For outdoor: verify IP rating matches exposure (minimum IP54)

#### Step 4: Electrical Connection
1. ⚠️ Verify circuit breaker is OFF before connecting
2. Strip cable ends, apply ferrules if using stranded conductor
3. Connect L, N (single-phase) or L1, L2, L3, N (three-phase) and PE to charger terminals
4. Torque all connections to manufacturer specification
5. Verify earth connection continuity
6. Close charger cover, ensure cable glands are sealed

#### Step 5: Testing & Commissioning
1. Turn on RCD — test with RCD test button (should trip)
2. Turn on MCB/MCCB
3. Power up charger — verify status LEDs/display show normal
4. Run charger self-test (most chargers have built-in diagnostic)
5. Test with actual EV if available:
   - Plug in → charger communicates with vehicle
   - Charging starts and current is stable
   - Emergency stop button works (if equipped)
6. Test RFID card / app access (if applicable)
7. Verify energy meter readings (if sub-metered)

### 5.4 OCPP Protocol Setup

> OCPP (Open Charge Point Protocol) is the industry standard for EV charger communication with central management systems.

#### OCPP Versions
- **OCPP 1.6-J:** Most widely deployed, JSON over WebSocket
- **OCPP 2.0.1:** Latest, adds security, device management, ISO 15118 support

#### Configuration Steps
1. **Network connection:** Connect charger to internet via Ethernet or 4G SIM
2. **OCPP backend URL:** Configure in charger settings (e.g., `wss://your-backend.com/ocpp`)
3. **Charge point ID:** Set unique identifier for each charger
4. **Authentication:** Configure security profile (Basic Auth or TLS certificates)
5. **Test heartbeat:** Verify charger sends regular heartbeat to backend
6. **Test transaction:** Start/stop charging session, verify data appears in management system

### 5.5 Solar + EV Charger Integration

#### Load Management Strategies

1. **Static load management:**
   - Set maximum charging current based on available building supply
   - Charger always operates at or below set limit
   - Simplest to implement, no communication needed

2. **Dynamic load management (DLM):**
   - Current sensor (CT clamp) on main supply measures real-time building load
   - Charger adjusts power to avoid exceeding main breaker capacity
   - Requires: CT clamp, communication link between meter and charger

3. **Solar surplus charging:**
   - Energy meter measures export power from solar
   - Charger increases power when solar surplus is available
   - Charger decreases power or stops when solar production drops
   - Requires: compatible smart meter, HEMS (Home Energy Management System), or charger with solar integration feature

#### Wiring for Solar + EV Integration
```
Utility Supply ─── Main Breaker ─┬── Distribution Board ─── Building Loads
                                 │
                                 ├── Solar Inverter AC Output
                                 │
                                 └── EV Charger (with CT clamp on main)
```

---

## 6. Inverter Configuration & Commissioning

### 6.1 Huawei SUN2000 Series — Overview

| Model | Power | MPPT | Strings/MPPT | Phases | Application |
|-------|-------|------|-------------|--------|-------------|
| SUN2000-2/3/3.68/4/4.6/5/6KTL-L1 | 2–6 kW | 2 | 1 per MPPT | Single | Residential |
| SUN2000-8/10/12/15/17/20KTL-M2 | 8–20 kW | 2 | 2 per MPPT | Three | Residential / Small C&I |
| SUN2000-30/36/40KTL-M3 | 30–40 kW | 4 | 2 per MPPT | Three | Commercial |
| SUN2000-50/60/70/100KTL-M1 | 50–100 kW | 4–6 | 2 per MPPT | Three | Commercial / Industrial |

### 6.2 Physical Installation

#### Mounting Requirements
1. **Location:** Indoor or outdoor (IP65 rated) — protected from direct rain splash preferred
2. **Wall mounting:** Minimum 300mm clearance above and below for ventilation
3. **Side clearance:** Minimum 100mm between multiple inverters
4. **Height:** Center of inverter at 1.2–1.6m from ground (for maintenance access)
5. **Surface:** Must support inverter weight (20–60 kg depending on model)

#### Mounting Procedure
1. Hold mounting bracket against wall, mark drill holes
2. Drill holes — use appropriate anchors for wall type:
   - Concrete: M10 × 80mm expansion bolts
   - Steel: M10 through-bolts
3. Secure mounting bracket — verify level
4. Hang inverter on bracket — verify secure engagement
5. Tighten retaining screws (bottom)

### 6.3 DC Connection

1. ⚠️ Verify DC isolator on inverter is OFF
2. Verify all string voltages and polarities with multimeter BEFORE connecting
3. Check string Voc is within inverter MPPT range:
   - MPPT voltage range (typical SUN2000): 140–980V DC
   - Maximum input voltage: 1100V DC
   - ⚠️ **NEVER exceed maximum input voltage — will destroy inverter**
4. Insert MC4 connectors into inverter DC inputs — listen for click
5. Verify string assignments match design:
   - MPPT1: String 1 (+/−), String 2 (+/−) — if applicable
   - MPPT2: String 3 (+/−), String 4 (+/−) — if applicable
6. Turn DC isolator to ON

### 6.4 AC Connection

1. ⚠️ Verify AC breaker is OFF
2. Remove inverter AC terminal cover
3. Connect AC cables:
   - Three-phase: L1 (Brown), L2 (Black), L3 (Grey), N (Blue), PE (Green-Yellow)
   - Single-phase: L (Brown), N (Blue), PE (Green-Yellow)
4. Torque terminal screws to specification (typically 1.5–2.0 Nm for residential, 3–4 Nm for commercial)
5. Replace terminal cover
6. Turn AC breaker ON

### 6.5 Communication Setup (Smart Dongle)

1. Install Huawei Smart Dongle (WLAN/4G) into inverter COM port
2. Dongle types:
   - **Smart Dongle-WLAN-FE:** WiFi + Ethernet — connects to local network
   - **Smart Dongle-4G:** Cellular — for sites without WiFi
3. Power on inverter (DC isolator ON) — dongle LED indicates status

### 6.6 FusionSolar App Configuration

#### Initial Setup
1. Download **Huawei FusionSolar** app (iOS/Android)
2. Create installer account at [eu.fusionsolar.huawei.com](https://eu.fusionsolar.huawei.com) or regional portal
3. Log in to app with installer credentials

#### Plant Creation
1. Tap "+" → "Create Plant"
2. Enter plant details:
   - Plant name
   - Address / GPS location
   - Plant capacity (kWp)
   - Grid connection type (grid-tied, self-consumption, feed-in)
   - Electricity price (for yield revenue calculation)
3. Save plant

#### Inverter Connection
1. Stand near inverter with phone WiFi on
2. In app: tap "Device Commissioning"
3. Connect to inverter WiFi hotspot:
   - SSID: `SUN2000-xxxxxxxxxx` (serial number)
   - Default password: `Changeme` (change immediately after first login)
4. App connects to inverter

#### Inverter Parameter Configuration

**Grid parameters (critical for Thailand):**

| Parameter | Setting for Thailand |
|-----------|---------------------|
| Grid code | Thailand (or closest: IEC 61727 / AS4777) |
| Nominal voltage | 230V (single-phase) / 400V (three-phase) |
| Nominal frequency | 50 Hz |
| Over-voltage trip Level 1 | 253V (110%) — trip in 2s |
| Over-voltage trip Level 2 | 265V (115%) — trip in 0.2s |
| Under-voltage trip Level 1 | 207V (90%) — trip in 2s |
| Under-voltage trip Level 2 | 184V (80%) — trip in 0.2s |
| Over-frequency trip | 51 Hz — trip in 0.2s |
| Under-frequency trip | 49 Hz — trip in 0.2s |
| Reconnection time | 60 seconds (after grid recovery) |
| Active power ramp rate | ≤10%/minute |
| Anti-islanding | Enabled (do NOT disable) |

> 🇹🇭 **Thailand Note:** Check with PEA/MEA for their specific required grid code settings. Some utilities may require specific parameter certificates from the inverter manufacturer. Huawei provides country-specific grid code settings — select "Thailand" if available in the inverter firmware, or use the closest IEC standard.

**Power control parameters:**

| Parameter | Typical Setting |
|-----------|----------------|
| Export limitation | Set if required by utility (0–100%) |
| Reactive power mode | Cosφ = 1.0 (default) or as required |
| Power factor | 1.0 (adjust if utility requires) |
| Active power limit | 100% (or as limited by agreement) |

#### Network Configuration (for monitoring)
1. In inverter settings → Communication
2. Configure Smart Dongle:
   - **WLAN:** Enter WiFi SSID and password of site router
   - **Ethernet:** Connect cable, set DHCP or static IP
   - **4G:** Insert SIM, configure APN if needed
3. Verify connection: inverter status shows "Connected" in FusionSolar portal

### 6.7 Anti-Islanding Verification

**What is anti-islanding?**
- Prevents inverter from powering the grid when utility power is lost
- Protects utility workers from electrocution during outage maintenance
- Required by all grid codes worldwide

**Built-in methods (Huawei SUN2000):**
- Active Frequency Drift (AFD)
- Sandia Frequency Shift (SFS)
- Reactive power variation
- Voltage and frequency monitoring

**Verification:**
1. After commissioning, with system running at >50% power:
2. Open main AC breaker (simulating grid loss)
3. Inverter must stop exporting within 2 seconds
4. Verify: inverter display shows grid disconnection
5. Close main AC breaker — inverter reconnects after 60-second wait

⚠️ **NEVER disable anti-islanding protection. It is a life-safety feature.**

---

## 7. Troubleshooting & Maintenance

### 7.1 Common Solar PV Faults & Solutions

#### Low Energy Production

| Symptom | Possible Cause | Diagnostic Step | Solution |
|---------|---------------|----------------|----------|
| Production below expected | Shading | Visual inspection at peak sun | Remove shade source or redesign |
| Production below expected | Dirty panels | Visual inspection | Clean panels with water + soft brush |
| Production below expected | Panel degradation | IV curve test | Replace panels if >10% below nameplate |
| Production below expected | Inverter clipping | Check inverter max AC output vs array size | Normal if DC/AC ratio >1.2; otherwise investigate |
| Gradual production decline | Soiling buildup | Compare pre/post cleaning yield | Establish cleaning schedule |
| Sudden production drop | String failure | Check Voc/Isc per string | Find and fix broken connector, cable, or panel |

#### No Production

| Symptom | Possible Cause | Diagnostic Step | Solution |
|---------|---------------|----------------|----------|
| Inverter not starting | No DC input | Check DC isolator position, measure Voc | Turn on isolator, fix DC wiring |
| Inverter not starting | AC grid lost | Check AC breaker, measure grid voltage | Restore AC supply |
| Inverter not starting | Inverter fault | Read error code on display/app | Refer to error code table |
| Inverter shows "Waiting" | Grid voltage/frequency out of range | Measure grid V and Hz | Wait for grid to stabilize, or adjust settings if allowed |
| Inverter shows "Fault" | Internal error | Record fault code, restart | Reset DC+AC, if persists contact Huawei support |

### 7.2 Huawei SUN2000 Error Codes

| Error Code | Description | Severity | Action |
|-----------|-------------|----------|--------|
| 2001 | DC input over-voltage | ⚠️ Critical | Check string Voc — too many panels in string? Reduce string length |
| 2002 | DC input reverse polarity | ⚠️ Critical | Turn off DC isolator, swap polarity, verify before re-energizing |
| 2011 | String voltage mismatch | Warning | Check for shading, broken panel, or incorrect string config |
| 2031 | Insulation resistance low | ⚠️ Critical | DC system earth fault — perform insulation resistance test, find fault |
| 2067 | String current backfeed | Warning | Check string fuses, possible bypass diode failure |
| 3001 | Grid over-voltage | Info | Grid issue — wait. If persistent, check grid connection |
| 3002 | Grid under-voltage | Info | Grid issue — wait. If persistent, check breaker connections |
| 3003 | Grid over-frequency | Info | Grid issue — wait |
| 3004 | Grid under-frequency | Info | Grid issue — wait |
| 3007 | Grid not detected | Warning | Check AC breaker, wiring, grid availability |
| 3025 | Leakage current too high | ⚠️ Critical | Possible insulation failure — perform insulation test on DC side |
| 3061 | Anti-islanding failure | ⚠️ Critical | Do NOT reset — contact Huawei support |
| 5039 | Internal fan failure | Warning | Check fan operation, replace if failed |
| 5067 | High temperature derating | Info | Normal in hot conditions — improve ventilation |
| 5068 | Communication failure | Info | Check Smart Dongle connection, network |

### 7.3 Preventive Maintenance Checklist

#### Monthly
- [ ] Check monitoring system — verify data logging, check for alerts
- [ ] Visual inspection from ground — any visible damage, new shading sources?

#### Quarterly
- [ ] Clean panels if soiled (Thailand: more frequent during dry/dusty season)
- [ ] Check cable ties and cable management — replace any degraded UV-damaged ties
- [ ] Inspect accessible MC4 connections — check for discoloration (heat damage)
- [ ] Check inverter ventilation — clean air filters if equipped

#### Annually
- [ ] Torque check on all AC terminals (with system de-energized)
- [ ] Thermal imaging scan of array under load
- [ ] Insulation resistance test of DC strings
- [ ] Earth continuity test
- [ ] Earth electrode resistance test
- [ ] Check SPD indicators — replace if triggered
- [ ] Verify inverter firmware is current
- [ ] Check mounting system — bolts, clamps, rails for looseness or corrosion
- [ ] Document all findings, compare with previous year

#### Every 5 Years
- [ ] IV curve test on representative sample of panels
- [ ] Compare system yield with original projections — assess degradation
- [ ] Review and replace DC fuses if present
- [ ] Inspect and replace weathered cable glands
- [ ] Full re-commissioning test per IEC 62446

### 7.4 Panel Degradation

| Type | Typical Rate | Detection Method |
|------|-------------|-----------------|
| Light-Induced Degradation (LID) | 1–3% in first year | Compare year 1 vs year 2 yield |
| Annual degradation | 0.3–0.7%/year (mono-Si) | Year-over-year yield comparison |
| PID (Potential Induced Degradation) | Variable, can be severe | IV curve test, electroluminescence |
| Hot spots | Develops over time | Thermal imaging |
| Micro-cracks | Can develop from thermal cycling | Electroluminescence testing |
| Delamination / yellowing | Visual after 10+ years | Visual inspection |

**Panel warranty typical terms:**
- Product warranty: 12–15 years
- Performance warranty: 25–30 years (≥80% of nameplate at year 25)

---

## 8. Battery Storage Installation

### 8.1 Huawei LUNA2000 Series — Overview

| Model | Capacity | Voltage | Max Power | Modules | Application |
|-------|----------|---------|-----------|---------|-------------|
| LUNA2000-5-S0 | 5 kWh | 100–500V | 2.5 kW | 1 module | Small residential |
| LUNA2000-10-S0 | 10 kWh | 100–500V | 5.0 kW | 2 modules | Medium residential |
| LUNA2000-15-S0 | 15 kWh | 100–500V | 5.0 kW | 3 modules | Large residential |
| LUNA2000-7/14/21-S1 | 7–21 kWh | 90–560V | 3.5–5.25 kW | 1–3 modules | Residential (newer series) |

### 8.2 Battery Installation Location

#### Requirements
- Indoor or outdoor (IP66 rated) — sheltered location preferred
- **Temperature range:** -10°C to +55°C operating (Thailand: ensure shade/ventilation to stay below 45°C for longevity)
- **Ventilation:** Minimum 200mm clearance on all sides
- **Floor:** Level, capable of supporting weight (80–150 kg depending on configuration)
- **Distance:** Within cable length of compatible inverter
- **Flood risk:** Elevate above potential flood level (≥300mm in flood-prone areas)

⚠️ **WARNING — Battery Safety:**
- Never store or install near flammable materials
- Maintain clear access for fire department
- Post "BATTERY STORAGE SYSTEM" warning sign
- Have fire extinguisher (CO2 or dry powder) nearby — NOT water

### 8.3 Physical Installation

#### LUNA2000 Stack Assembly

1. **Place power module (bottom unit)**
   - This contains the Battery Management System (BMS) and power electronics
   - Secure to wall using mounting bracket (if wall-mounted) or place on floor (floor-mounted)
   - Level the unit precisely — use adjustable feet

2. **Stack battery modules**
   - Stack battery modules on top of power module
   - Each module clicks/locks into place — verify engagement
   - Maximum stack: 3 battery modules per power module
   - ⚠️ Heavy lifting — each module weighs ~25–30 kg. Use two people.

3. **Secure the stack**
   - Install anti-tip bracket (wall anchor) at top of stack
   - Tighten inter-module fasteners if provided

### 8.4 Electrical Connection

#### DC Connection (Battery to Inverter)

1. Use supplied battery DC cable (specific connector, not generic MC4)
2. Route cable from LUNA2000 to compatible Huawei inverter battery port
3. Cable length: use Huawei-supplied cable, do not extend without specification
4. Connect battery DC connector to inverter — ensure proper locking

⚠️ **CRITICAL:** 
- Only connect LUNA2000 to compatible Huawei inverters (SUN2000-xKTL-M1/L1 series with battery port)
- Never mix battery module capacities in one stack
- Never connect batteries from different stacks in parallel without Huawei-approved configuration

#### Communication Connection

1. Connect communication cable (supplied) from battery to inverter COM port
2. This enables BMS-to-inverter communication
3. Battery will not charge/discharge without communication link

#### Grounding

1. Connect battery earth terminal to main earth bar
2. Use 6 mm² minimum green-yellow conductor
3. Earth bonding must be connected before energizing

### 8.5 BMS Configuration via FusionSolar

#### Battery Commissioning Steps

1. **Power on sequence:**
   - Turn on AC breaker → inverter powers up
   - Turn on battery DC breaker (on LUNA2000 power module)
   - Battery modules power up — BMS initializes

2. **FusionSolar app configuration:**
   - Connect to inverter via app
   - Navigate to: Settings → Battery
   - Verify battery is detected (shows capacity, SOC, temperature)
   - Configure battery working mode:

| Mode | Description | Use Case |
|------|-------------|----------|
| **Maximum Self-Consumption** | Charge from solar excess, discharge when solar insufficient | Most common residential |
| **Time-of-Use (TOU)** | Charge during off-peak, discharge during peak | Where TOU tariffs exist |
| **Fully Fed to Grid** | Battery not used, all solar exported | Special cases only |
| **Backup (Emergency)** | Reserve battery capacity for power outage | Areas with unreliable grid |

3. **Set backup SOC reserve:**
   - Configure minimum State of Charge (e.g., 10–20%)
   - Below this level, battery stops discharging to preserve for emergency backup

4. **Set charge/discharge times (TOU mode):**
   - Define peak hours, off-peak hours
   - Set charge source: solar only or solar + grid

5. **Verify operation:**
   - Monitor in FusionSolar app:
     - Battery charging during solar production
     - Battery discharging during evening consumption
     - SOC percentage changing appropriately
   - Check no error codes on battery status

### 8.6 Battery Safety Testing

| Test | Method | Pass Criteria |
|------|--------|--------------|
| Visual inspection | Check all connections, no damage | No visible issues |
| Earth continuity | Ohmmeter from chassis to earth bar | ≤1Ω |
| Communication | FusionSolar shows battery data | All modules detected, SOC reading |
| Charge test | Monitor charging from solar | Current flows, SOC increases |
| Discharge test | Create load, monitor discharge | Current flows, SOC decreases |
| Emergency stop | Turn off battery DC breaker | Battery disconnects immediately |
| BMS cell balance | Check via FusionSolar | Cell voltages within 50mV of each other |

### 8.7 Battery Wiring Diagram (Residential Hybrid System)

```
                                    ┌─────────────────────┐
                                    │   SOLAR ARRAY       │
                                    │   (Panels in        │
                                    │    Series Strings)  │
                                    └────────┬────────────┘
                                             │ DC (MC4)
                                             │
                                    ┌────────▼────────────┐
                                    │   DC ISOLATOR       │
                                    └────────┬────────────┘
                                             │
                              ┌──────────────▼──────────────┐
                              │   HUAWEI SUN2000 INVERTER   │
                              │   (Hybrid - with battery    │
                              │    port)                    │
                              │                             │
                              │   PV Input ← DC from array  │
                              │   BAT Port ← DC to battery  │
                              │   AC Output → to grid/load   │
                              └──┬──────────────┬───────────┘
                                 │              │
                          DC Battery        AC Output
                          Cable             │
                                 │              │
                    ┌────────────▼──┐     ┌─────▼──────────┐
                    │  HUAWEI       │     │  AC BREAKER     │
                    │  LUNA2000     │     │  (Dedicated     │
                    │  BATTERY      │     │   Solar)        │
                    │  STACK        │     └─────┬──────────┘
                    │               │           │
                    │  ┌──────────┐ │     ┌─────▼──────────┐
                    │  │Module 3  │ │     │  DISTRIBUTION   │
                    │  ├──────────┤ │     │  BOARD          │
                    │  │Module 2  │ │     │                 │
                    │  ├──────────┤ │     │  ← Utility In   │
                    │  │Module 1  │ │     │  → Building     │
                    │  ├──────────┤ │     │    Loads        │
                    │  │Power     │ │     │  → EV Charger   │
                    │  │Module    │ │     └─────────────────┘
                    │  │(BMS)     │ │
                    │  └──────────┘ │
                    └───────────────┘
```

---

## Appendix A: Essential Tools for Solar PV Electricians

### Hand Tools
| Tool | Use | Specification |
|------|-----|--------------|
| MC4 crimping tool | Crimping MC4 contacts | Matched to MC4 brand (Stäubli, etc.) |
| MC4 spanner wrench | Assembly/disassembly of MC4 | Matched to connector type |
| Cable stripper | Stripping solar cable insulation | For 2.5–10 mm² cables |
| Cable cutter | Cutting solar and AC cables | Rated for 35 mm² minimum |
| Torque wrench set | Tightening bolts to spec | 5–50 Nm range |
| Hex key set (Allen) | Mounting hardware | Metric 3–10mm |
| Socket wrench set | Rail bolts, clamps | Metric 10–19mm |
| Wire ferrule crimper | AC terminations | For 0.5–16 mm² ferrules |
| Label maker | Cable and breaker labeling | Durable outdoor labels |

### Test Equipment
| Instrument | Use | Key Specification |
|-----------|-----|-------------------|
| Digital Multimeter (DMM) | Voc, polarity, AC voltage | CAT III 1000V, DC voltage ≥1000V |
| DC Clamp Meter | Isc, operating current | DC current measurement, ≥20A |
| Insulation Resistance Tester (Megger) | Cable insulation testing | Test voltage ≥1000V DC |
| Earth Resistance Tester | Ground rod testing | 3-point method, ≤200Ω range |
| Low-Resistance Ohmmeter | Earth continuity | Resolution 0.01Ω |
| Thermal Camera | Hot spot detection | Resolution ≥160×120, sensitivity ≤0.1°C |
| IV Curve Tracer | Panel performance | Voltage ≥1000V, current ≥15A |

### Safety Equipment
| Item | Standard |
|------|---------|
| Insulated gloves | Class 0 (1000V) or Class 00 (500V) minimum |
| Safety glasses | ANSI Z87.1 or EN 166 |
| Hard hat | EN 397 |
| Safety harness + lanyard | For roof work — EN 361 |
| Arc flash face shield | For work near live AC panels |
| First aid kit | Including burn treatment |
| Fire extinguisher | CO2 or dry powder |
| Lockout/tagout (LOTO) kit | For de-energizing procedures |

---

## Appendix B: Quick Reference Tables

### String Sizing Guide (Huawei SUN2000)

To calculate maximum panels per string:
```
Max panels = Floor(Inverter Max Vdc / Panel Voc at lowest temperature)
Min panels = Ceiling(Inverter Min MPPT V / Panel Vmp at highest temperature)
```

**Temperature correction for Thailand:**

| Condition | Cell Temp | Voc Factor | Vmp Factor |
|-----------|----------|------------|------------|
| Cool morning (startup) | 30°C | ×0.985 | ×0.985 |
| Hot afternoon | 65°C | ×0.880 | ×0.870 |
| Extreme hot (still air) | 75°C | ×0.850 | ×0.835 |

> Use lowest temperature for max string length, highest temperature for min string length

### Common Panel Specifications (2024–2026 era)

| Parameter | Typical Value (550–580W panel) |
|-----------|-------------------------------|
| Voc | 49–52 V |
| Vmp | 41–44 V |
| Isc | 13.5–14.5 A |
| Imp | 12.8–13.5 A |
| Dimensions | ~2278 × 1134 × 30 mm |
| Weight | ~28–32 kg |
| Efficiency | 21–23% |
| Temp coefficient (Voc) | −0.25 to −0.30 %/°C |
| Temp coefficient (Pmax) | −0.30 to −0.38 %/°C |

---

## Appendix C: Reference Links

### Standards & Codes
- IEC 62548 — Design requirements for PV arrays
- IEC 62446-1 — PV systems: Testing, documentation, and maintenance
- IEC 61215 — Crystalline silicon PV module design qualification
- IEC 61730 — PV module safety qualification
- IEC 62116 — Islanding prevention test procedure
- IEC 62196 — Plugs, socket-outlets, connectors for EV charging
- IEC 61851 — EV conductive charging system

### Thailand Regulatory Bodies
- **PEA** (Provincial Electricity Authority): [www.pea.co.th](https://www.pea.co.th)
- **MEA** (Metropolitan Electricity Authority): [www.mea.or.th](https://www.mea.or.th)
- **ERC** (Energy Regulatory Commission): [www.erc.or.th](https://www.erc.or.th)
- **EIT** (Engineering Institute of Thailand): [www.eit.or.th](https://www.eit.or.th)
- **Council of Engineers Thailand**: [www.coe.or.th](https://www.coe.or.th)

### Manufacturer Documentation
- **Huawei FusionSolar Portal**: [eu.fusionsolar.huawei.com](https://eu.fusionsolar.huawei.com)
- **Huawei SUN2000 Product Page**: [solar.huawei.com](https://solar.huawei.com)
- **Huawei Support (Inverters)**: [support.huawei.com/enterprise](https://support.huawei.com/enterprise)
- **OCPP Protocol**: [www.openchargealliance.org](https://www.openchargealliance.org)

### Training Resources
- **NABCEP (US certification reference)**: [www.nabcep.org](https://www.nabcep.org)
- **PVTRAIN (EU training standard)**: Search "PVTRAIN solar installer qualification"

---

## Appendix D: Glossary

| Term | Definition |
|------|-----------|
| **Voc** | Open Circuit Voltage — voltage when no current flows (disconnected) |
| **Isc** | Short Circuit Current — current when terminals are shorted |
| **Vmp** | Voltage at Maximum Power Point |
| **Imp** | Current at Maximum Power Point |
| **MPPT** | Maximum Power Point Tracking — inverter function to optimize power extraction |
| **STC** | Standard Test Conditions — 1000 W/m², 25°C cell temp, AM1.5 spectrum |
| **kWp** | Kilowatt-peak — rated power at STC |
| **SOC** | State of Charge — battery charge level as percentage |
| **BMS** | Battery Management System — monitors and protects battery cells |
| **SPD** | Surge Protection Device — protects against voltage spikes |
| **RCD** | Residual Current Device — detects earth leakage faults |
| **MCB** | Miniature Circuit Breaker |
| **MCCB** | Molded Case Circuit Breaker (higher current rating) |
| **CT** | Current Transformer — sensor for measuring current non-invasively |
| **DLM** | Dynamic Load Management |
| **OCPP** | Open Charge Point Protocol |
| **PEA** | Provincial Electricity Authority (Thailand) |
| **MEA** | Metropolitan Electricity Authority (Thailand) |
| **ERC** | Energy Regulatory Commission (Thailand) |
| **EIT** | Engineering Institute of Thailand |
| **IP65/66/67** | Ingress Protection rating (dust/water resistance level) |
| **THW** | Single-core PVC insulated cable (common in Thailand) |
| **NYY** | Multi-core PVC insulated and sheathed cable |
| **VCT** | Flexible multi-core cable (Thailand designation) |

---

> **Document maintained by:** TM Energy Academy  
> **Last updated:** 2026-03-15  
> **Review schedule:** Quarterly — verify Thailand regulatory requirements against current PEA/MEA/ERC publications  
> **Disclaimer:** While this document is based on established international standards (IEC) and known Thai regulatory frameworks, specific PEA/MEA requirements, approved equipment lists, and ERC licensing procedures should be verified against current official publications before relying on them for permit applications. All electrical specifications (cable sizes, test values, protection ratings) are based on IEC standards and manufacturer datasheets.
