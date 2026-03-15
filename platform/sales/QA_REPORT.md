# QA Report — TM Energy Sales App

**File:** `platform/sales/index.html` (845 lines)  
**Date:** 2026-03-15  
**Auditor:** Pixel (QA Agent)  
**Status:** Issues found and CRITICAL/HIGH fixed

---

## Summary

| Severity | Count | Fixed |
|----------|-------|-------|
| CRITICAL | 3     | ✅ All |
| HIGH     | 9     | ✅ All |
| MEDIUM   | 7     | ❌ (deferred) |
| LOW      | 3     | ❌ (deferred) |

---

## CRITICAL Issues

### C1: XSS Vulnerability in `renderLeadCard()` ✅ FIXED
**Lines:** ~535-545  
**Description:** Lead name, location, and property are interpolated directly into innerHTML via template literals without sanitization. A malicious lead name like `<img src=x onerror=alert(1)>` would execute arbitrary JavaScript.  
**Affected fields:** `l.name`, `l.location`, `l.property`, `l.status`  
**Fix:** Added `escapeHtml()` utility function; all user data passes through it before innerHTML injection.

### C2: XSS Vulnerability in `showLeadDetail()` ✅ FIXED
**Lines:** ~670-740  
**Description:** Same XSS pattern in lead detail view. Lead name, location, phone, email, notes, and timeline actions are all injected unsanitized into innerHTML.  
**Fix:** All user-provided values sanitized via `escapeHtml()`.

### C3: XSS Vulnerability in `addNote()` ✅ FIXED
**Lines:** ~760  
**Description:** User-entered note text is pushed to timeline array and rendered via innerHTML without sanitization.  
**Fix:** Note text sanitized before storage and rendering.

---

## HIGH Issues

### H1: `user-scalable=no` Blocks Zoom — WCAG Violation ✅ FIXED
**Line:** 4  
**Description:** `maximum-scale=1.0, user-scalable=no` prevents users from zooming. Violates WCAG 2.1 SC 1.4.4 (Resize Text). Critical accessibility failure.  
**Fix:** Removed `maximum-scale=1.0` and `user-scalable=no` from viewport meta.

### H2: Icon Button Touch Targets Below 44px Minimum ✅ FIXED
**Line:** 41  
**Description:** `.icon-btn` is 38x38px. WCAG 2.5.5 requires minimum 44x44px touch targets for mobile.  
**Fix:** Increased to 44x44px.

### H3: `renderLeadsList()` Mutates Array via `.reverse()` ✅ FIXED
**Line:** ~555  
**Description:** `filtered.reverse()` reverses the array in-place. Since `filtered` may reference the original leads array (when no search query), repeated calls flip the order back and forth.  
**Fix:** Changed to `[...filtered].reverse()` to avoid mutation.

### H4: Missing Settings Screen ✅ FIXED
**Lines:** 490, 237  
**Description:** Nav item and icon button call `showScreen('settings')` but no `<div id="screen-settings">` exists. User sees blank content.  
**Fix:** Added settings screen with app info and data management (export/clear).

### H5: No Service Worker — PWA Offline Broken ✅ FIXED
**Description:** `manifest.json` is referenced but no `sw.js` exists. PWA install will work but offline caching won't. The app should work offline since it's localStorage-based.  
**Fix:** Added inline service worker registration and created `sw.js` with cache-first strategy.

### H6: Manifest Missing 512x512 Icon ✅ FIXED
**Description:** PWA spec recommends both 192x192 and 512x512 icons. Only 192x192 is present. Chrome will warn on install.  
**Fix:** Added 512x512 entry to manifest (points to same file, browser will scale).

### H7: `filterLeads()` Doesn't Actually Filter ✅ FIXED
**Line:** ~558  
**Description:** Clicking pipeline cards (New/Survey/Proposal/Won) calls `filterLeads(status)` but the function just shows all leads. Misleading UX — user expects filtered view.  
**Fix:** Implemented actual status filtering via a `currentFilter` variable.

### H8: NaN Display When Bill Data Missing ✅ FIXED
**Lines:** ~700-710  
**Description:** `parseInt(lead.bill.cost)` on empty string returns `NaN`. Displayed as "฿NaN" in lead detail. Same for `lead.bill.kwh`.  
**Fix:** Added fallback `|| 0` for all parseInt/parseFloat calls on bill data, plus conditional rendering.

### H9: `calcStandaloneBill()` Division by Zero ✅ FIXED
**Line:** ~810  
**Description:** When savings is 0, `payback = invest / savings` yields `Infinity`, displayed as "Infinity years".  
**Fix:** Added guard: display "N/A" when savings is 0.

---

## MEDIUM Issues (Not Fixed — Deferred)

### M1: Color Contrast Below WCAG AA for Small Text
**Lines:** 29-30  
**Description:** `--text-dim: rgba(255,255,255,.4)` on `--navy: #0A1628` yields ~4.2:1 contrast ratio. WCAG AA requires 4.5:1 for small text. Labels like `.lbl`, `.lead-meta`, `.qa-sub` use this color.  
**Proposed fix:** Increase to `rgba(255,255,255,.5)` (~5.2:1 ratio).

### M2: No Visual Form Validation Feedback
**Description:** Only validation is `alert('Please enter a name')`. No red borders, inline error messages, or visual indicators on invalid fields.  
**Proposed fix:** Add `.form-input.error` class with red border + inline error message element.

### M3: No Loading States
**Description:** No spinners, skeleton screens, or progress indicators anywhere. File uploads and calculations happen instantly so impact is low, but bill photo "AI analysis" should show a loading state.  
**Proposed fix:** Add shimmer/skeleton animation while processing bill photos.

### M4: No FileReader Error Handling
**Lines:** ~600, 610, 790  
**Description:** `reader.onerror` is never set. If file read fails, nothing happens — no feedback to user.  
**Proposed fix:** Add `reader.onerror` with user-facing error message.

### M5: Missing `alt` Attributes on Preview Images
**Lines:** 345, 375, 435  
**Description:** `<img class="photo-preview">` elements have no `alt` attribute. Screen readers can't describe the content.  
**Proposed fix:** Add descriptive alt text (e.g., `alt="Bill photo preview"`).

### M6: Missing `<label for="">` Associations
**Description:** Form labels use `<label class="form-label">` but no `for` attribute linking to inputs. Screen readers can't associate labels with inputs.  
**Proposed fix:** Add matching `for` and `id` attributes, or wrap inputs inside labels.

### M7: `localStorage.setItem` Without Quota Handling
**Line:** ~515  
**Description:** `saveLeads()` calls `localStorage.setItem()` without try/catch. If storage quota is exceeded (especially with base64 photo data potentially stored), data silently fails to save.  
**Proposed fix:** Wrap in try/catch, show user-friendly error if quota exceeded.

---

## LOW Issues (Not Fixed — Deferred)

### L1: Demo Data Re-Appears After Deletion
**Lines:** ~835-845  
**Description:** If user deletes all leads, demo data is re-inserted on next page load because the check is `getLeads().length === 0`.  
**Proposed fix:** Set a `tm_sales_initialized` flag in localStorage after first run.

### L2: WhatsApp Link Invalid When Phone Empty
**Line:** ~700  
**Description:** If lead has no phone, generates `href="https://wa.me/"` which opens WhatsApp but with no recipient. Minor — just confusing UX.  
**Proposed fix:** Conditionally render WhatsApp button only when phone exists.

### L3: `parseInt` Without Radix
**Multiple lines**  
**Description:** Several `parseInt()` calls without explicit radix 10. While modern engines default to base-10, explicit radix is best practice.  
**Proposed fix:** Add `, 10` to all parseInt calls.

---

## UI/UX Assessment

### Mobile Responsiveness ✅ Good
- CSS is mobile-first with `max-width:480px` for tablet+
- Uses `env(safe-area-inset-bottom)` for notch devices
- Grid layouts collapse properly
- Bottom nav is fixed and responsive

### Typography ✅ Good
- Inter font with proper weight hierarchy (300-700)
- Clear size progression for headers, body, labels
- Good line spacing

### Navigation ✅ Good
- Bottom nav is standard mobile pattern
- Back buttons present on all sub-screens
- Active states clearly indicated with green color

### Empty States ✅ Good
- Dashboard shows "No leads yet" empty state
- Search shows "No leads found"
- Roof Survey and Proposal Builder show "Coming Soon"

### Touch Targets ⚠️ Mostly Good (H2 fixed)
- Buttons: 14px padding = ~48px height ✅
- Cards: Large touch areas ✅
- Icon buttons: Fixed from 38px to 44px ✅
- Nav items: Adequate with padding ✅

---

## Files Modified
1. `platform/sales/index.html` — All CRITICAL and HIGH fixes applied
2. `platform/sales/manifest.json` — Added 512x512 icon entry
3. `platform/sales/sw.js` — Created (service worker for offline PWA)
