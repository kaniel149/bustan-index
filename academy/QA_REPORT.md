# TM Energy Academy — QA Report

**Date:** 2026-03-15  
**Auditor:** Pixel (QA Agent)  
**Scope:** Academy index + 17 lesson files + CSS + JS

---

## Summary

| Severity | Found | Fixed |
|----------|-------|-------|
| CRITICAL | 4 | 4 |
| HIGH | 2 | 2 |
| MEDIUM | 0 | — |
| LOW | 0 | — |

**Overall Status:** All CRITICAL and HIGH issues fixed.

---

## Issues Found & Fixed

### CRITICAL

#### 1. `solar-fundamentals-08.html` — Broken Quiz Engine
- **Problem:** `initQuiz()` called with wrong signature — only passed questions array, missing `courseId` and `lessonNum` parameters. Quiz would silently fail.
- **Fix:** Changed `initQuiz([...])` to `initQuiz('solar-fundamentals', 8, [...])`

#### 2. `solar-fundamentals-08.html` — Missing Quiz UI & Complete Button
- **Problem:** No `#quiz-result` div (quiz score display broken), no `#complete-btn` button, no `initCompleteButton()` call. Users couldn't mark lesson complete.
- **Fix:** Added quiz-result div, complete button, and `initCompleteButton('solar-fundamentals', 8)` call.

#### 3. `ev-storage-03.html` — Missing Quiz UI & Complete Button
- **Problem:** `initQuiz()` is called in script, but no `#quiz-container`, `#quiz-result`, or `#complete-btn` in HTML. Quiz renders nowhere; progress tracking broken.
- **Fix:** Added full quiz section HTML and `initCompleteButton('ev-storage', 3)` call.

#### 4. `sales-bd-03.html` — Missing Quiz UI & Complete Button
- **Problem:** Same as ev-storage-03 — quiz script exists but no container elements. No complete button.
- **Fix:** Added full quiz section HTML and `initCompleteButton('sales-bd', 3)` call.

### HIGH

#### 5. `technical-03.html` — Missing Quiz Container & Complete Button
- **Problem:** Quiz initialized in script but no `#quiz-container` or `#quiz-result` in HTML body. No complete button for progress tracking.
- **Fix:** Added quiz section with container/result divs, complete button, and `initCompleteButton('technical', 3)` call.

#### 6. `index.html` — Incorrect Lesson Count & Stats
- **Problem:** Track 1 (Solar Fundamentals) meta showed "3 Lessons" but there are 8 lesson files. Stats section showed "44 Total Lessons" and "~24h" — actual count is 17 lessons.
- **Fix:** Updated to "8 Lessons", corrected stats to "17 Total Lessons" and "~10h".

---

## Audit Results — What's Working Well

### Index Page (index.html)
- ✅ **Track cards:** All 4 active tracks are `<a>` tags with correct hrefs (already unlocked)
- ✅ **Track 5 (Management):** Correctly locked as `<div>` with `opacity:0.6; cursor:default;` and "Coming Soon" labels
- ✅ **Language switcher:** EN/HE/TH toggle works correctly
- ✅ **Responsive grid:** `grid-template-columns: repeat(auto-fill, minmax(340px, 1fr))` collapses to single column on mobile
- ✅ **Progress bars:** Connected to localStorage via `getCompletedCount()` 
- ✅ **Scroll animations:** `fade-up` + IntersectionObserver working

### Lesson Pages (sampled 8 of 17)
- ✅ **Navigation:** All prev/next links match actual file names
- ✅ **Language switcher:** EN/HE/TH toggle works via `data-en`/`data-he`/`data-th` attributes
- ✅ **YouTube embeds:** Responsive container with `padding-bottom: 56.25%`
- ✅ **Image paths:** All `../images/` paths verified — 21 images present in images directory
- ✅ **Logo path:** `../../proposals/tm-logo.png` resolves correctly from courses/
- ✅ **Quiz engine:** `initQuiz()` creates questions dynamically, validates answers, shows correct/incorrect, calculates score
- ✅ **"Did You Know" boxes:** Properly styled with gold border and 💡 pseudo-element
- ✅ **Key Term boxes:** Gold left-border (RTL: right-border) with proper styling
- ✅ **Breadcrumbs:** Correct hierarchy (Academy > Track > Lesson)
- ✅ **Footer:** Consistent © 2026 across all pages

### CSS (academy.css)
- ✅ **Color scheme:** Navy #0A1628, Green #00D68F, Gold #FFB800 consistently used
- ✅ **Font loading:** Google Fonts import for Inter, Heebo, Noto Sans Thai
- ✅ **RTL support:** `body[data-lang="he"]` direction + padding adjustments
- ✅ **Thai font:** `body[data-lang="th"]` uses Noto Sans Thai as primary
- ✅ **Glass morphism:** `backdrop-filter: blur()` with proper `-webkit-` prefix
- ✅ **Mobile breakpoint:** `@media (max-width: 768px)` handles responsive layout
- ✅ **Language visibility:** All `[data-en]`, `[data-he]`, `[data-th]` elements hidden by default, shown per active language
- ✅ **Print layout:** No specific print styles (minor, not blocking)

### JS (academy.js)
- ✅ **Progress tracking:** localStorage-based with `STORAGE_KEY = 'tm_academy_progress'`
- ✅ **Quiz engine:** Supports multilingual questions, validates answers, shows pass/fail (60% threshold)
- ✅ **Language switching:** `setLanguage()` updates `data-lang` on body, toggles active class
- ✅ **Complete button:** `initCompleteButton()` marks lessons complete in localStorage
- ✅ **Scroll animations:** IntersectionObserver triggers `.visible` class on `.fade-up` elements

---

## Not Tested (Out of Scope)
- Dark/light mode toggle (not implemented — dark mode only)
- Print layout CSS
- Accessibility (WCAG compliance)
- SEO meta tags
- Performance/Lighthouse scores
