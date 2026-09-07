# Bustan Academy role curriculum

Release: `paths-20260907`. Research review date: 7 September 2026.

The academy home introduces six role paths. Each starts with the same eight foundation lessons, then nine specialist lessons. Completion of the foundation counts across all roles. The 62 new lessons contain full English, Hebrew and Thai teaching content, worked examples, exercises with model answers, checklists and 310 explained quiz questions. Source records preserve publication/version dates, review dates and limitations. The earlier 24 lessons and their URLs remain in `library.html`.

| Role | Specialist focus |
| --- | --- |
| Installers | Issued design, roof interfaces, coastal materials, DC/AC interfaces, backup/EV interfaces, inspection and supervised handover |
| Technical service | Commissioning, measurement, PV/inverter/battery diagnostics, monitoring, preventive maintenance and controlled repair |
| Sales | Discovery, bills and loads, qualification, value, tariffs, proposals, warranties, negotiation and operations handover |
| Finance | Measurement boundaries, bill differences, tariffs, lifecycle cash flows, NPV/IRR/LCOE, DSCR, tax/FX, risk and investment decisions |
| Leadership | Responsibility, island schedules, procurement, safety/quality, contractors, changes, payment gates, service KPIs and recovery |
| Design and permitting | Surveys, yield, supervised strings, protections, storage/EV, drawings, separate authority decisions and as-built acceptance |

## Learning and assessment

New quizzes require 80% (four of five questions); the earlier library retains its 60% threshold. Completion requires a passing score and the learner's completion action. Reading ahead is available; the guided next step starts with unfinished foundation lessons. The final path assignment lists deliverables and a trainer rubric. Online completion is a knowledge checkpoint, not a professional licence or practical sign-off.

Notes and progress remain browser-local. Learners can download a UTF-8 text notebook. A conflict between open tabs preserves the active draft, presents explicit choices and exports the displayed answer. No employee accounts, cross-device service, trainer submission endpoint or automatic certificate is implied. Source checks and translation completeness have been reviewed; no claim of a native-speaker panel or regulated training accreditation is made.

Foundation lesson 3 includes an interactive constant-power AC energy balance. Available solar potential, direct use, grid import and curtailment are separate; batteries and export are excluded from this training model.

## Authoring and generation

Edit the four JSON bundles under `curriculum/`; the schema is documented in `curriculum/AUTHORING.md`. The files under `learning/`, `paths/`, the home page, the source directory and `assets/curriculum-index.js` are generated.

```
node academy/tools/build-curriculum.mjs
node academy/tests/run-all.mjs
```

Tests cover data/schema/languages/source references, generated anchors and JavaScript, conservation in the energy model, shared foundation sequencing, search, legacy progress retention, quiz thresholds, storage failure and concurrent notebook changes. Browser verification covers desktop/mobile Hebrew/English/Thai, lesson navigation, notes, quiz completion and the energy exercise.

Before changing tariff or permitting content, verify the relevant primary authority publication and effective date for the actual customer class, system and location. Product manual examples are model-specific and never imply PEA approval or universal settings. Keep training assumptions clearly separate from current project facts.

## Visual learning

Every one of the 86 lessons (62 role-curriculum lessons and 24 earlier lessons) includes an original diagram and a selected professional video with lesson-specific observation prompts, takeaway and reflection question. The diagram, caption, text alternative and guidance are authored in English, Hebrew and Thai. Desktop/mobile SVG variants preserve all text and provide a larger dialog view. Four introductory lessons also show the clearly labelled AI-generated generic equipment identification image.

The video library at `media.html` groups 33 unique videos and links each to its related lessons; multilingual topic search and original-audio filtering are available. Original publisher titles/audio are preserved. Captions and translation availability are controlled by YouTube/publishers, and videos are not represented as professionally dubbed in all languages. Embeds use youtube-nocookie and load only after a click; source links remain available. No video completion or watch-time tracking is added.

Edit the four `media-data/*.json` source bundles and rebuild with the curriculum generator. The video ledgers document exact source/title/channel checks on 7 September 2026 and the limits of older or manufacturer-specific demonstrations. Original diagrams are academy teaching models, not installation schematics. Earlier generated images and unverified video blocks have been removed from the visible lesson pages. Existing quizzes and progress storage remain intact.
