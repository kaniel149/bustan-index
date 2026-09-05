# תדריך לעו"ד — בדיקת חוזי PPA ו-EPC (ספטמבר 2026)

**למי:** Belaws / Konrad Legal (תאילנד) · **ממי:** Kaniel Tordjman, Bustan Energy (Koh Phangan, Surat Thani) · **תאריך:** 5.9.2026
**קבצים:** `bustan-index/ppa-contract.html` (PPA למגורים/עסקים, 15 שנה) · `bustan-index/epc-contract.html` (EPC — מכירה והתקנה). שניהם תבניות דו-לשוניות (עברית לניהול פנימי + מילון EN/TH בתוך הקובץ). הגרסה שתיחתם: אנגלית + תאילנדית.

## 1. מה שינינו ב-4.9.2026 (לאשר/לתקן)

| # | חוזה · סעיף | לפני | אחרי (4.9.2026) | מה לבדוק |
|---|---|---|---|---|
| 1 | PPA §12.3 · EPC §6.2 — ריבית פיגורים | 1.5% לחודש | **1.25% לחודש (15% לשנה, "בכפוף לתקרה החוקית")** | האם תקרת 15% של **CCC §654** (וחוק איסור ריבית מופרזת 2475) חלה בכלל על ריבית פיגורים בחוזה שירות/מכר — או רק על הלוואות? האם בית משפט יראה בזה "เบี้ยปรับ" (קנס) שניתן להפחית לפי **CCC §383**? האם עדיף לנסח כ-"ריבית ברירת המחדל לפי **§7 (3%) + §224 (+2%) = 5%**, בתוספת X" כדי להיות בטוחים? הצעת ניסוח תאילנדי. |
| 2 | PPA §4 — הצמדה | לא מוגדר / 3% | **ב-1 בינואר, לפי הנמוך מבין CPI תאילנד או עליית תעריף PEA (כולל Ft); רצפה 0%; תקרה 1.5%/שנה** | האם ההצמדה למדד/תעריף PEA חוקית וברורה מספיק לאכיפה? האם צריך להגדיר מדד ספציפי (CPI Headline של משרד המסחר, לא BoT) ומה קורה אם PEA משנה מבנה תעריף (כמו ספטמבר 2026). |
| 3 | PPA §9.1, §10.1, §10.2 — זמינות | לא הוגדר | **ערבות זמינות 95%/שנה (לפי שעות אור); מתחת ל-95% פיצוי בגובה kWh אבודים × תעריף PPA; מתחת ל-80% שנתיים רצופות → זכות ביטול לצרכן (§16)** | סבירות הנוסחה, האם נדרש מנגנון מדידה מוסכם (מונה/ניטור), והאם זכות הביטול צריכה להיות מלווה ברכישת המערכת או בהסרתה על חשבוננו. |
| 4 | PPA §14.2 · EPC §11.2 — ביטוח צד ג' | לא הוגדר | **PPA ฿2,000,000 לאירוע · EPC ฿1,000,000 לאירוע** | האם הסכומים סבירים לשוק הביטוח התאילנדי לרוף-טופ 10–100 kW, ומה הנוסח שמבטח ידרוש (שם המבוטח, שיפוי, additional insured). |
| 5 | EPC §7 (לוח זמנים) · PPA — אישור PEA | 7–14 יום / 30–90 יום | **"אישור PEA + חיבור לרשת: 15–30 ימי עבודה"** (בטבלת EPC סה"כ 28–49 ימים) | האם עיכוב PEA מעבר לכך צריך להיות "אירוע מותר" (Excusable Delay) מפורש, ומי נושא בעלות אם PEA דורש שינוי תכנון. |
| 6 | סעיף שפה (שני החוזים) | לא היה | **"חוזה זה ייחתם בגרסה דו-לשונית (אנגלית + תאילנדית). במקרה של סתירה — הגרסה התאילנדית גוברת."** | אישור שזה הנוסח המקובל בתאילנד, ובדיקה שתרגום ה-TH שלנו אכן זהה משפטית לאנגלית (אנחנו צריכים תרגום מאושר?). |
| 7 | PPA §21.3 · EPC §20.3 — בוררות | — | **3 שלבים: מו"מ → גישור → בוררות לפי חוק הבוררות התאילנדי (2545). מקום: Surat Thani. שפה (PPA): אנגלית** | האם בוררות היא הכלי הנכון לחוזי צרכן של 10–50 kW (עלות/אכיפה) לעומת בית משפט אזורי בקו סמוי/סוראט; אם כן — איזה מוסד (THAC / TAI) והאם "שפה אנגלית" תקף מול צרכן תאילנדי. |

עוד נתונים שעודכנו בחוזים ורק דורשים אישור עקביות: תעריף PPA ฿3.80/kWh (ציון "≈16–20% מתחת לתעריף PEA השולי 4.5–4.9 כולל מע"מ"); אבני דרך תשלום EPC 30/40/30; אחריות עבודה 5 שנים, אינוורטר 10, מודול 12/25; O&M ฿500/kWp/שנה. מחירים מוצגים "לפני מע"מ".

## 2. שאלות משפטיות לתשובה

1. **מע"מ על מכירת חשמל ב-PPA.** Bustan (רשומה למע"מ) מוכרת kWh לצרכן פרטי/עסקי. האם זו אספקת "סחורה" או "שירות" ל-VAT 7%? האם יש פטור/שיעור מיוחד לחשמל ממקור מתחדש? איך להציג בחשבונית (e-Tax Invoice) ומה ההשלכה על לקוח פרטי שלא מקזז מע"מ.
2. **הודעת פטור ERC (<1,000 kVA) — על שם מי?** במודל PPA המערכת בבעלות Bustan על גג הלקוח. האם הודעת הפטור/הרישום ב-PPIM חייבת להיות על שם **בעל המערכת** (Bustan) או **בעל המונה** (הלקוח)? האם מכירת חשמל "מאחורי המונה" לצד ג' נחשבת "กิจการจำหน่ายไฟฟ้า" שדורשת רישיון גם מתחת ל-1 MW? (ERC Ann. 74-2568).
3. **ניכוי המס ฿200,000 (צו מלכותי 805, 3.3.2026–31.12.2028).** התנאים: יחיד בעל המונה, ≤10 kWp, on-grid, e-Tax Invoice מספק רשום למע"מ, מערכת אחת, בשנת החיבור. להבנתנו **לא חל ב-PPA** (הלקוח לא משלם capex). אישור, וכן: (א) האם "רכישה" בתשלומים (installment sale) או lease-to-own כן זכאית; (ב) האם מוכר זר/בעלות זרה משפיע; (ג) האם ה-150% לתאגידים (ציוד 5 כוכבים) חל על מערכת PV.
4. **הגנת הצרכן על PPA למגורים ל-15 שנה.** האם חוזה PPA לצרכן פרטי הוא "חוזה מתוקנן" (Unfair Contract Terms Act 2540) ו/או נתון לפיקוח OCPB (ประกาศคณะกรรมการว่าด้วยสัญญา)? האם יש סעיפים שלנו שייחשבו "לא הוגנים": תקופה 15 שנה ללא יציאה, זכות כניסה לנכס, קנס ביטול מוקדם (buy-out), הצמדה אוטומטית, ויתור על תביעות. האם נדרשת תקופת צינון/זכות ביטול.
5. **מידע אישי והסכמה לניטור (PDPA 2562).** אנחנו קוראים נתוני ייצור/צריכה מרחוק (Huawei FusionSolar / מונה חכם) ומשתפים עם מממן/מבטח. איזו הסכמה נדרשת בחוזה, מדיניות פרטיות, מינוי DPO, העברת נתונים לחו"ל (שרתי Huawei / Supabase בסינגפור).
6. (משני) **הבטחת הזכות במקרקעין** — האם לרשום את ה-PPA/זכות הגישה כ-servitude/lease על הנכס (15 שנה > 3 שנים → רישום בלשכת המקרקעין?) כדי להגן מפני מכירת הנכס; מה קורה בפשיטת רגל של הלקוח; שעבוד המערכת לבנק (GSB/TTB).

## 3. מה אנחנו צריכים לקבל

- הערות עוקבות (redline) על שני הקבצים, בעדיפות לסעיפים 1–7 בטבלה.
- תשובות בכתב לשאלות 1–5 (שאלה 6 אם הזמן מאפשר), עם הפניה לחוק/תקנה.
- הצעת מחיר לתרגום משפטי מאושר EN→TH של שני החוזים.
- לוח זמנים: נשמח לתשובה ראשונית עד **19.9.2026** (לפני חתימות Q4 ורישום מתקין PEA עד 30.9).

---

# English summary for counsel

**Client:** Bustan Energy (Koh Phangan, Surat Thani) — rooftop solar EPC and 15-year residential/commercial PPAs, 5–100 kW. **Documents:** `ppa-contract.html`, `epc-contract.html` (bilingual EN/TH templates). **Requested by:** 19 Sep 2026.

**Changes made 4 Sep 2026 — please confirm or correct:**
1. Late-payment interest cut from 1.5%/month to **1.25%/month (15%/yr), "subject to the statutory cap"** (PPA §12.3, EPC §6.2). Does the 15% cap in CCC §654 / the Excessive Interest Prohibition Act apply to default interest in a service/sale contract at all, or could a court treat it as a reducible penalty (§383)? Would "statutory default rate under §7 + §224 (currently 5%) plus x%" be safer? Please propose Thai wording.
2. PPA §4 escalation: annually on 1 Jan, **lower of Thai CPI or PEA tariff increase (incl. Ft), floor 0%, cap 1.5%/yr**. Enforceability, index definition, and what happens if PEA restructures tariffs.
3. PPA §9.1/§10.1/§10.2: **95% availability guarantee**, shortfall compensation = lost kWh × PPA tariff, **<80% two consecutive years = customer termination right** (§16).
4. Third-party liability insurance: **฿2,000,000 per occurrence (PPA §14.2)**, **฿1,000,000 (EPC §11.2)** — market-reasonable?
5. PEA approval and grid connection stated as **15–30 working days** (EPC §7 timeline; total 28–49 days). Should PEA delay be an express excusable delay?
6. New **bilingual clause: Thai text prevails** in case of conflict (both contracts).
7. Dispute resolution: negotiation → mediation → **arbitration under the Thai Arbitration Act, seat Surat Thani** (PPA: English language). Appropriate for small consumer contracts? Which institution?

**Questions:**
- VAT (7%) treatment of electricity sold under a behind-the-meter PPA to individuals and businesses; invoicing (e-Tax Invoice).
- Whether the ERC exemption notification (<1,000 kVA, ERC Announcement 74-2568) and PEA PPIM filing must be in the name of the **system owner (Bustan)** or the **meter owner (customer)**; whether selling power behind the meter to a third party is a licensable "electricity distribution" business below 1 MW.
- Royal Decree No. 805 (฿200,000 personal deduction, 3 Mar 2026 – 31 Dec 2028): confirm it is **not available under a PPA**; whether instalment sales / lease-to-own qualify; whether the corporate 150% deduction covers PV systems.
- Consumer protection for 15-year residential PPAs: Unfair Contract Terms Act B.E. 2540, OCPB contract-control notifications, cooling-off / early-termination buy-out, right of entry.
- PDPA B.E. 2562: consent for remote monitoring (Huawei FusionSolar / smart meter), sharing with lenders/insurers, cross-border transfer (Huawei / Supabase Singapore).
- Secondary: registering PPA access rights against the property (>3-year term), customer insolvency, pledging systems to GSB/TTB lenders.
