# TM Energy Academy — Improvement Plan

## Current Status
- **17 lessons** across 4 tracks (720KB total)
- **Average quality score: ~58%** (target: 85%+)
- **Main gaps:** Missing navigation, no images/videos in some lessons, inconsistent structure

---

## Phase 1: Structural Consistency ⚠️ CRITICAL
**Goal:** Every lesson has the same HTML structure and navigation

| # | Task | Files Affected | Est. Time |
|---|------|---------------|-----------|
| 1 | Add `<section class="lesson-section fade-up">` wrappers | 14 lessons | 30 min |
| 2 | Add prev/next navigation buttons | 14 lessons | 20 min |
| 3 | Fix "Lesson X of 10" → "of 3" counters | sales-01, sales-02 | 5 min |
| 4 | Verify/add footer to all lessons | All 17 | 10 min |
| 5 | Ensure all lessons use `<link rel="stylesheet" href="../assets/academy.css">` consistently | All 17 | 5 min |

**Expected score improvement: +10-15 pts average**

---

## Phase 2: Missing Media 🟡 HIGH
**Goal:** Every lesson has ≥1 image and ≥1 video

### Missing Images (4 lessons with 0 images):
| Lesson | Needs | Source |
|--------|-------|--------|
| sf-06 (System Sizing) | Sizing formula diagram | Gemini generate |
| sf-07 (Energy Economics) | ROI chart / payback graph | Gemini generate |
| sales-01 (Solar Customer) | Customer persona infographic | Gemini generate |
| sales-02 (Sales Process) | Sales funnel diagram | Gemini generate |

### Missing Videos (8 lessons with 0 videos):
| Lesson | Topic to Search | Channel Suggestions |
|--------|----------------|-------------------|
| sf-06 | Solar system sizing tutorial | The Solar Lab, Will Prowse |
| sf-07 | Solar ROI / payback period explained | Solar Saving, EcoFlow |
| sf-08 | Solar panel cleaning & maintenance | eFIXX, Jasonoid |
| sales-03 | Solar sales closing techniques | Solar Academy, Solar Pros |
| tech-03 | Huawei SUN2000 installation | Huawei FusionSolar |
| ev-01 | Home battery storage explained | The Solar Lab |
| ev-02 | EV charger installation guide | Fully Charged |
| ev-03 | Solar + EV integration | EcoFlow, Fully Charged |

**Expected score improvement: +15-20 pts for affected lessons**

---

## Phase 3: Interactive Enhancements 🟡 HIGH
**Goal:** Rich interactive elements in every lesson

| # | Task | Details |
|---|------|---------|
| 1 | Add spec-tables to data-heavy lessons | ~13 lessons need tables |
| 2 | Add key-concept boxes | ~14 lessons missing |
| 3 | ROI Calculator (JS) | Add to sales-03: input kWp → output payback, savings |
| 4 | String Sizing Calculator (JS) | Add to tech-02: input panels, Voc → string config |
| 5 | Battery Sizing Calculator (JS) | Add to ev-01: input consumption → battery kWh |
| 6 | Progress bar in academy.js | localStorage: lesson completion, quiz scores |

**Expected score improvement: +10 pts average**

---

## Phase 4: Content Quality 🔵 MEDIUM
**Goal:** Accurate, professional, locally relevant content

| # | Task |
|---|------|
| 1 | Thai translations review by native speaker |
| 2 | Update PEA/ERC regulatory data to 2026 |
| 3 | Replace Gemini images with real TM Energy photos where available |
| 4 | Review all 68 quiz questions for accuracy and difficulty |
| 5 | Add Huawei SUN2000 real datasheet specs |
| 6 | Cross-reference electrician training with PEA/MEA guidelines |

---

## Phase 5: UX & Design 🔵 MEDIUM

| # | Feature | Impact |
|---|---------|--------|
| 1 | Reading time estimate per lesson | Low effort, nice UX |
| 2 | Print/PDF export button | Useful for offline study |
| 3 | Mobile responsiveness audit (375px) | Critical for field use |
| 4 | Scroll progress indicator | Visual engagement |
| 5 | IntersectionObserver fade-in animations | Polish |
| 6 | Dark/light mode toggle | Accessibility |

---

## Phase 6: Advanced Features 🟢 FUTURE

| # | Feature | Complexity |
|---|---------|-----------|
| 1 | Management course (Track 5, 3 lessons) | Medium |
| 2 | Employee progress dashboard (Supabase) | High |
| 3 | Certificate PDF generation on completion | Medium |
| 4 | Final exam mode (timed, 80% pass) | Medium |
| 5 | academy.energy-tm.com subdomain | Low |
| 6 | Full-text search across all content | Medium |

---

## Execution Order
1. **Phase 1** → Script to fix all 14 lessons in one pass (~30 min)
2. **Phase 2** → Generate 4 images + find 8 YouTube videos (~1 hour)
3. **Phase 3** → Add tables, key concepts, calculators (~1 hour)
4. **Phase 4-5** → Content review + UX polish (ongoing)
5. **Phase 6** → After core quality reaches 85%+

## Quality Scoring
| Component | Max Points |
|-----------|-----------|
| Content size (>25KB) | 10 |
| Quiz (4 questions) | 15 |
| Did-you-know box | 5 |
| Key-concept box | 5 |
| Section wrappers | 5 |
| Images (≥2) | 15 |
| Videos (≥2) | 15 |
| Navigation buttons | 10 |
| Tables (≥2) | 10 |
| Trilingual | 10 |
| **Total** | **100** |
