# הצעת מחיר — מערכת סולארית + אגירה
# מפעל בטון, קופנגן, תאילנד

## מיקום
- **GPS**: 9.7145°N, 99.9856°E
- **מיקום**: Koh Phangan, Surat Thani, Thailand
- **GHI שנתי**: 5.5 kWh/m²/day (Peak Sun Hours ≈ 4.5-5.0)

---

## ניתוח גגות

### מבנה 1 (อาคาร 1)
- **מידות גג**: 16.0m × 6.5m (מתוכנית)
- **שטח גג גולמי**: 104 sqm
- **סוג גג**: Metal Sheet 0.35mm, משופע ~25°
- **שטח שמיש (70%)**: **73 sqm**
- **כיוון**: TBD (צריך לאשר מתוכנית site)

### מבנה 2 (อาคาร 2)
- **הערכה** (לפי פרופורציה דומה): 16.0m × 6.5m
- **שטח גג גולמי**: ~104 sqm
- **שטח שמיש (70%)**: **73 sqm**

### מבנה 3 (อาคาร 3)
- **הערכה** (מידות דומות): ~104 sqm
- **שטח שמיש (70%)**: **73 sqm**

### סה"כ שטח גג שמיש: **219 sqm**

---

## תכנון מערכת PV

### פאנלים
- **דגם**: LONGi Hi-MO X6 580W (או שווה ערך)
- **מידות פאנל**: 2.278m × 1.134m = 2.58 sqm
- **כמות**: 219 ÷ 2.58 = **84 פאנלים**
- **הספק מותקן**: 84 × 580W = **48.7 kWp**

### ייצור שנתי צפוי
- Peak Sun Hours: 4.5 h/day (שמרני, כולל עונת גשמים)
- Performance Ratio: 0.80
- **ייצור יומי**: 48.7 × 4.5 × 0.80 = **175 kWh/day**
- **ייצור שנתי**: 175 × 365 = **63,875 kWh/year**

### אינוורטרים
- **דגם**: Huawei SUN2000-50KTL-M3 (50kW)
- **כמות**: 1 יחידה
- **String design**: 4 strings × 21 panels (או 6 × 14)
- **MPPT**: 4 inputs

---

## מערכת אגירה (Battery Storage)

### אפשרות A — 4 שעות גיבוי
- **קיבולת**: 50 kWh
- **דגם**: Huawei LUNA2000-S1-15kWh × 4 = 60 kWh
- **אינוורטר היברידי**: Huawei SUN2000-50KTL-M3 (hybrid mode)

### אפשרות B — 8 שעות גיבוי (מומלץ למפעל)
- **קיבולת**: 100 kWh
- **דגם**: Huawei LUNA2000-S1-15kWh × 7 = 105 kWh
- **שימוש**: Peak shaving + backup

---

## הצעת מחיר

### PV System — 48.7 kWp

| רכיב | כמות | מחיר/יח' (THB) | סה"כ (THB) |
|------|------|----------------|-----------|
| LONGi 580W Panels | 84 | 5,500 | 462,000 |
| Huawei 50kW Inverter | 1 | 185,000 | 185,000 |
| Mounting Structure (metal roof) | 1 lot | - | 168,000 |
| DC Cables & Connectors | 1 lot | - | 45,000 |
| AC Cables & Protection | 1 lot | - | 55,000 |
| Installation Labor | 1 lot | - | 120,000 |
| Design & Engineering | 1 lot | - | 35,000 |
| Transport to Koh Phangan | 1 lot | - | 45,000 |
| **סה"כ PV** | | | **1,115,000** |

### Battery Storage — Option A (60 kWh)

| רכיב | כמות | מחיר/יח' (THB) | סה"כ (THB) |
|------|------|----------------|-----------|
| Huawei LUNA2000-15kWh | 4 | 165,000 | 660,000 |
| Battery Inverter/Controller | 1 | 85,000 | 85,000 |
| Installation + Wiring | 1 lot | - | 45,000 |
| **סה"כ Battery A** | | | **790,000** |

### Battery Storage — Option B (105 kWh)

| רכיב | כמות | מחיר/יח' (THB) | סה"כ (THB) |
|------|------|----------------|-----------|
| Huawei LUNA2000-15kWh | 7 | 165,000 | 1,155,000 |
| Battery Inverter/Controller | 1 | 85,000 | 85,000 |
| Installation + Wiring | 1 lot | - | 55,000 |
| **סה"כ Battery B** | | | **1,295,000** |

---

## סיכום חבילות

| חבילה | רכיבים | מחיר (THB) | מחיר (USD) |
|-------|--------|-----------|-----------|
| **PV Only** | 48.7 kWp solar | **1,115,000** | ~$31,000 |
| **PV + Battery A** | 48.7 kWp + 60 kWh | **1,905,000** | ~$53,000 |
| **PV + Battery B** | 48.7 kWp + 105 kWh | **2,410,000** | ~$67,000 |

**עלות ל-Wp**: 22.9 THB/Wp ($0.64/Wp) — PV only
**עלות ל-Wp + Battery**: 39.1-49.5 THB/Wp

---

## ROI Analysis

### חיסכון שנתי (PV Only)
- **ייצור**: 63,875 kWh/year
- **תעריף PEA**: 4.26 THB/kWh (commercial)
- **חיסכון שנתי**: 63,875 × 4.26 = **272,108 THB/year** (~$7,560)
- **החזר השקעה**: 1,115,000 ÷ 272,108 = **4.1 שנים**

### חיסכון שנתי (PV + Battery B)
- **חיסכון נוסף מ-peak shaving**: ~15% = 40,816 THB/year
- **חיסכון כולל**: 312,924 THB/year
- **החזר השקעה**: 2,410,000 ÷ 312,924 = **7.7 שנים**

### אורך חיי מערכת: 25+ שנים
### ערך כולל חיסכון (25 שנה): **6,802,700 THB** (~$189,000)

---

## תוכנית חשמלית (SLD - Single Line Diagram)

```
[84× LONGi 580W]
     │
     ├── String 1: 21 panels → MPPT 1
     ├── String 2: 21 panels → MPPT 2  
     ├── String 3: 21 panels → MPPT 3
     └── String 4: 21 panels → MPPT 4
            │
     [DC Combiner Box]
            │
     [DC Disconnect Switch]
            │
     [Huawei SUN2000-50KTL]──[AC Disconnect]──[Meter]──[PEA Grid]
            │
     [Battery Controller]
            │
     [Huawei LUNA2000 × 4-7]
```

### String Design
- **Voc per panel**: 51.8V
- **21 panels in series**: 21 × 51.8V = 1,087.8V (within 1,100V inverter max)
- **Isc per string**: 14.03A
- **4 strings parallel**: 56.12A total

---

## העמדת פאנלים על הגגות

### Mounting Configuration
- **סוג**: Rail mount על metal sheet roof (L-foot + clamps)
- **כיוון**: Portrait (אורך פאנל לאורך הגג)
- **שורות**: ~6 שורות × 14 פאנלים per building
- **מרווח**: 20mm בין פאנלים, 100mm מקצה גג
- **זווית**: 0° (שטוח על הגג) — גג כבר בשיפוע 25° דרום

### Per Building Layout
```
Building 1 (16m × 6.5m):
┌────────────────────────────┐
│ [P][P][P][P][P][P][P][P]   │  Row 1 (8 panels)
│ [P][P][P][P][P][P][P][P]   │  Row 2
│ [P][P][P][P][P][P][P][P]   │  Row 3
│ [P][P][P][P]               │  Row 4 (partial)
└────────────────────────────┘
= 28 panels per building × 3 buildings = 84 panels
```

---

## הערות
1. מידות מבנה 2 ו-3 מוערכות לפי מבנה 1. **צריך אישור מידות בפועל.**
2. מחירים כוללים משלוח לקופנגן (מעבורת מסוראת'אני)
3. לא כולל היתר PEA (אם נדרש מעל 10kW)
4. זמן אספקה: 4-6 שבועות מאישור
5. אחריות: פאנלים 25 שנה, אינוורטר 10 שנה, סוללות 10 שנה

---

*Bustan Energy — Solar & EV Solutions, Koh Phangan*
*Contact: k@kanielt.com*
