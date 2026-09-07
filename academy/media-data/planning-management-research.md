# Planning and management media verification

Verified: 2026-09-07. Scope: 24 packs — design-permitting-01 through -09, leadership-01 through -09, and management-01 through -06. Only the media bundle and this ledger were edited. Existing lesson prose, technical diagrams and runtime code were preserved.

## Method and limitations

The nine local video records use exact YouTube IDs published by the originating institution. Official NLR/System Advisor Model pages were read with web search/open and fetched as HTML to inspect their video embeds. The official NPTEL course page exposes the selected lecture titles and `youtube_id` values together. YouTube oEmbed GET requests independently returned every selected title and channel name shown below on the verification date. There are no guessed IDs or copied legacy `VIDEO_LIBRARY` entries.

Content matching uses the official webinar descriptions and lecture syllabus, supplemented by the indexed YouTube descriptions for the stakeholder-risk and critical-path lectures. It is not a claim that each full recording was watched or transcribed. No footage was downloaded, re-edited, dubbed or republished. No duration, timestamp, current playback availability in every country, translated speech or available Hebrew/Thai subtitles is asserted. The learning guidance is original English/Hebrew/Thai text; source videos remain in their original English. Older SAM versions are expressly labelled. NPTEL's course page lists English lecture transcript resources; additional regional-language resources are not presented as verified Hebrew or Thai support.

The SAM pages' current domain is `sam.nlr.gov`. Their official video links identify the channel as **System Advisor Model**, handle **@SAMDemoVideos**. NPTEL's official IIT Kanpur course maps its lecture IDs to the YouTube channel **Project Management**, handle **@projectmanagement7918**. The generic channel name was not accepted on name alone: the primary institution's course-to-ID mapping establishes provenance.

YouTube oEmbed endpoint pattern used: `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=VIDEO_ID&format=json`. Successful responses included exact `title`, `author_name` and `author_url`. Metadata-only scratch evidence was stored outside the published site during verification.

## Verified local video records

| Bundle ID | Exact original title and YouTube ID | Exact publisher | Primary evidence and supported scope |
|---|---|---|---|
| pm-load | [Download Modeled Load Data](https://www.youtube.com/watch?v=urimEINWuYw) — `urimEINWuYw` | System Advisor Model | [Official SAM How-to page](https://sam.nlr.gov/howto.html) embeds this task demonstration. Supports distinguishing a downloaded modeled profile from observed site demand. |
| pm-pv | [Modeling PV Systems in SAM 2020.2.29](https://www.youtube.com/watch?v=ba5NcqlANZQ) — `ba5NcqlANZQ` | System Advisor Model | [Official PV videos page](https://sam.nlr.gov/photovoltaic/pv-videos.html) describes PV case design, string/system sizing, input data and loss modeling. Explicit older software release. It is not cable/protection design approval or an installation procedure. |
| pm-uncertainty | [Modeling PV Uncertainty in SAM](https://www.youtube.com/watch?v=xIA-AmGfQ5E) — `xIA-AmGfQ5E` | System Advisor Model | [Official simulation-options page](https://sam.nlr.gov/simulation-options.html) embeds the July 2024 webinar. Supports uncertainty as an element of a modeled production estimate, not a yield guarantee. |
| pm-battery | [Behind-the-meter Battery Dispatch in SAM](https://www.youtube.com/watch?v=KCzPGf_9YKQ) — `KCzPGf_9YKQ` | System Advisor Model | [Official battery videos page](https://sam.nlr.gov/battery-storage/battery-videos.html) lists the fall 2023 behind-the-meter dispatch session. Dispatch choices are model inputs, not proof of outage capability or universal commissioning settings. |
| pm-reliability | [Photovoltaic Reliability Performance Model in SAM 2017.9.5](https://www.youtube.com/watch?v=tdQEt_cO2To) — `tdQEt_cO2To` | System Advisor Model | [Official PV videos page](https://sam.nlr.gov/photovoltaic/pv-videos.html) describes the December 2017 PVRPM introduction by Geoff Klise and Janine Freeman. This older model supports questions about reliability and performance; local failure records, test evidence and service capacity are original lesson applications. |
| pm-risk | [Project Stakeholder and Risk Management](https://www.youtube.com/watch?v=qxdL1TNjR4s) — `qxdL1TNjR4s` | Project Management | [Official NPTEL / IIT Kanpur course 110104073](https://nptel.ac.in/courses/110104073), lecture 6, instructor Raghu Nandan Sengupta. Official course HTML associates this ID with this title. Indexed video description identifies stakeholder management, risk/uncertainty and risk-management stages. General management, not Thai law or electrical work instruction. |
| pm-cpm | [Concept of CRITICAL PATH METHOD (CPM) and Introduction to PERT](https://www.youtube.com/watch?v=TuoxrttyxpQ) — `TuoxrttyxpQ` | Project Management | [Official NPTEL course](https://nptel.ac.in/courses/110104073), lecture 21. Official course HTML maps this ID. Indexed video description includes precedence, early/late starts, forward pass and PERT. Applied to the lesson's explicitly fictional project network, not guaranteed field timelines. |
| pm-evm | [Earned Value Management](https://www.youtube.com/watch?v=mcW4yNs_bzc) — `mcW4yNs_bzc` | Project Management | [Official NPTEL course](https://nptel.ac.in/courses/110104073), lecture 33 in the earned-value module. ID, title and channel verified via primary course HTML plus oEmbed. Guidance compares the lecture's general performance method with the lesson's cost forecasts and evidence requirements; it does not attribute contractual payment rights to the lecturer. |
| pm-finance | [Discounting Rates and Project Pricing](https://www.youtube.com/watch?v=C1k9Ul6Bc9w) — `C1k9Ul6Bc9w` | Project Management | [Official NPTEL course](https://nptel.ac.in/courses/110104073), lecture 26. ID, title and channel verified via primary course HTML plus oEmbed. Supports the effect of cash-flow timing and discounting. The lesson's comparison of payback, IRR and LCOE is original diagram content; the video is not described as covering all three metrics. |

## Shared safety record

`management-05` refers to root's canonical **base-electrical-safety** record rather than duplicating it locally:

- [Solar Safety - How to manage electrical risks](https://www.youtube.com/watch?v=fxH9P-347F4), ID `fxH9P-347F4`, exact publisher **SafeWork NSW**, English.
- Primary source: [SafeWork NSW solar-panel retail and installation](https://www.safework.nsw.gov.au/hazards-a-z/solar-panel-retail-and-installation).
- Parent/root verified the official page and oEmbed metadata and owns the record in `foundation.json`. A follow-up web-open from this subtask timed out, so this ledger distinguishes the parent's completed verification from that retry.
- Guidance explicitly labels the Australian context and calls for competent local verification of Thai requirements and site procedures. The diagram is a task-specific assessment/reassessment cycle, with no procedural electrical-isolation or height-work instructions.

## Lesson-to-video reasoning

| Lessons | Video | Reason for reuse and boundary |
|---|---|---|
| design-permitting-01 | pm-load | Evidence provenance: downloaded model data versus measured site information. |
| design-permitting-02, -09 | pm-uncertainty | Shade-estimate uncertainty and capstone challenge of assumptions. A model does not close independent professional or authority questions. |
| design-permitting-03, -04, -06 | pm-pv | Sizing inputs, modeled losses and consistent model/document inputs. Guidance distinguishes model functions from datasheet limits, conductor/protection assessment and controlled drawing release. |
| design-permitting-05 | pm-battery | Model dispatch objective versus verified energy, power and operating-mode boundaries. |
| design-permitting-08, leadership-08, management-04 | pm-reliability | Traceable asset baseline, actual service records and capacity to support equipment reliability. No universal service interval or promise is inferred from the video. |
| design-permitting-07, leadership-01, -04, -05, -06, management-03 | pm-risk | Distinct stakeholder/decision ownership, critical-control governance, subcontract interfaces and risk versus change. The learner is explicitly told that this is general management, not Thai approval training. |
| leadership-02, management-01, -06 | pm-cpm | Task precedence, parallel dependencies and shared resources. Island logistics are an original lesson application. |
| leadership-03, -07, -09 | pm-evm | Achieved work, remaining exposure, evidence-based forecasts and recovery; technical acceptance and contractual payment remain distinct. |
| management-02 | pm-finance | Discounting and timing assumptions that allow financial metrics to be interpreted. No current Thai financial offer or tariff claim. |
| management-05 | base-electrical-safety | Qualified safety awareness and reassessment, with Australian context and Thai/site-specific verification boundary. |

## Diagram evidence and quality checks

All 24 diagrams are original instructional data authored for the existing lesson, not reproductions of third-party charts. There are 3–4 labelled nodes in every diagram. English labels contain at most 5 words and details at most 12; Hebrew and Thai are comparably concise. English captions are 25–55 words; Hebrew and Thai express the same learning relationship and boundary in natural language. Every pack has an explanatory alt text plus distinct watch-for, takeaway and learner question in all three languages.

The five diagrams with arithmetic (three bars and two flows) use **existing labelled lesson training examples** only:

- design-permitting-02: 15,000, 14,100 and 12,900 kWh/year under the stated shade assumptions. Difference 1,200 kWh/year; no self-use/export/savings entitlement inferred.
- design-permitting-03: 573.1 V for eleven modules, fictional 600 V inverter limit and 625.2 V for twelve. Voltage screening only; hot voltage, current and manufacturer/professional checks remain.
- leadership-02: the flow visual preserves the lesson network `5 + max(8,8) + 3 + 1 = 17` training days; procurement at 10 gives 19. This is a labelled flow, not a bar chart and not a promise about PEA or suppliers.
- leadership-03: the additive flow preserves 120,000 actual + 70,000 remaining committed + 30,000 uncommitted = 220,000 THB, with no double counting.
- leadership-08: 60 committed, 80 qualified available and 90 hours with proposed work; 10-hour deficit.

Other diagrams use relationships, alternatives or decision categories, not invented site numbers.

No diagram asserts a new statutory threshold, tariff, export entitlement, equipment setting or professional certification. The planning and legacy permits diagrams group six independent decisions without a universal sequence: PEA connection, applicable no-export controls, export agreement, ERC license/exemption status, building/professional requirements and inspection/acceptance. Current applicability still belongs to the primary regulatory sources and authorities identified in the curriculum.

Validation performed on the complete bundle:

- 24 unique expected lesson slugs: 9 planning + 9 leadership + 6 legacy management.
- 9 local verified video IDs, plus one explicit reference to root's shared safety record.
- All YouTube IDs are 11 valid characters and all video references resolve locally or to the named shared record.
- 334 nonempty trilingual objects; no Hebrew characters in Thai fields and no Thai characters in Hebrew fields.
- Allowed diagram types, 3–4 nodes, numeric bar values and units, English label/detail limits and English caption lengths all passed.

## Candidates excluded

A PEA NEWS university solar-rooftop ceremony video and the parent's PEA channel service-orientation clip were considered as context but not selected as expert permit instruction. They do not establish the current application sequence or approval conditions for Koh Phangan. Third-party lecture mirrors were used only for discovery; final NPTEL provenance is the official course page. Legacy unknown IDs were not used. Several direct YouTube page fetches were throttled while oEmbed succeeded; verification therefore relies on the official originating page plus successful oEmbed metadata, not on fabricated playback claims.
