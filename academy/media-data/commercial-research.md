# Bustan Academy — commercial visual lesson research

Verified on **2026-09-07**. Scope: `sales-01`–`sales-09`, `finance-01`–`finance-09`, and `sales-bd-01`–`sales-bd-04`. The matching bundle is `commercial.json`.

## Verification method and boundaries

All eight YouTube URLs returned **HTTP 200** from YouTube's public oEmbed endpoint. Each response exactly matched the stored video title and publisher (the HubSpot publisher's trailing whitespace was trimmed). IDs are eleven characters. The metadata was checked twice while authoring, including the final validation. The endpoint is `https://www.youtube.com/oembed?url=<encoded watch URL>&format=json`.

Primary publisher pages, official course transcripts and official video descriptions establish the subjects below. This is a curated subject and metadata review, not a claim of a complete frame-by-frame viewing. Some direct YouTube page opens were throttled; the successful oEmbed responses and publisher embeds provided independent identification. No duration, timestamp, translated speech, subtitle availability or publication date has been invented. All selected videos are original English-language resources; the lesson guidance is authored separately in English, Hebrew and Thai. External availability and regional playback can change.

The original diagrams summarize the existing Bustan lessons. They are not copied third-party illustrations, wiring diagrams, installation instructions or evidence of a particular property's performance. Illustrative numbers are explicitly labelled and retain the lesson's assumptions. The new media does not validate historical commercial examples or extend any programme, financing or warranty claim to a different customer.

## Verified video register

### com-load-import

- **Exact title:** Importing Load Data from a Text File
- **Video:** [Official SAM tutorial](https://www.youtube.com/watch?v=hb7mNmlzZZs)
- **Publisher/channel:** System Advisor Model — [@SAMDemoVideos](https://www.youtube.com/@SAMDemoVideos)
- **Primary provenance:** [SAM Residential and Commercial models](https://sam.nlr.gov/financial-models/residential-and-commercial.html) embeds this exact ID under its short load-import tutorial.
- **Verified subject:** importing a load-data text file. Used for `sales-02` to support meter-specific input preparation.
- **Boundary:** importing a file does not establish that it represents the correct meter, units or period. Older interface; no current Thai tariff claim.

### com-bill-savings

- **Exact title:** Electricity Rates and Bill Savings for Residential and Commercial Projects in SAM 2017.1.17
- **Video:** [Official SAM webinar](https://www.youtube.com/watch?v=yDziI9J8Qjc)
- **Publisher/channel:** System Advisor Model — [@SAMDemoVideos](https://www.youtube.com/@SAMDemoVideos)
- **Primary provenance:** [SAM Residential and Commercial models](https://sam.nlr.gov/financial-models/residential-and-commercial.html) embeds the ID with a description of load, rates, bill savings and cash-flow inputs/results.
- **Verified subject:** the relationship between a customer's electricity bill and project cash flow. Used for `finance-01`, `finance-02`, `sales-bd-04`.
- **Boundary:** the recorded software version and US examples are not current PEA tariff, export or Thai tax guidance. No sample return is adopted as a promise.

### com-bill-calculator

- **Exact title:** Electricity Bill Calculator Updates
- **Video:** [Official SAM calculator webinar](https://www.youtube.com/watch?v=DYV8Grz-9kA)
- **Publisher/channel:** System Advisor Model — [@SAMDemoVideos](https://www.youtube.com/@SAMDemoVideos)
- **Primary provenance:** [SAM Residential and Commercial models](https://sam.nlr.gov/financial-models/residential-and-commercial.html) embeds the ID and describes billing/metering model options.
- **Verified subject:** bill-calculation options, including different treatment of exported electricity. Used for `sales-05` and `finance-03`.
- **Boundary:** software options confer no permission or export-purchase entitlement. Applicable PEA class, period and contract evidence must come from the lesson's current primary-source ledger and actual project documents.

### com-financial-models

- **Exact title:** Financial Models for Utility-scale Projects in SAM
- **Video:** [Official SAM financial-model webinar](https://www.youtube.com/watch?v=IRZj-01cjz8)
- **Publisher/channel:** System Advisor Model — [@SAMDemoVideos](https://www.youtube.com/@SAMDemoVideos)
- **Primary provenance:** [SAM PPA financial models](https://sam.nlr.gov/financial-models/utility-scale-ppa.html) embeds this ID; [official supporting slides](https://sam.nrel.gov/images/webinar_files/sam-webinars-2023-fom-financial-models.pdf) identify the presentation.
- **Verified subject:** ownership-specific financial models and their inputs/results. Used for `finance-04`, `finance-06`, `finance-08`, `finance-09` to connect the lesson's own costs, cash-flow boundary and financing analysis.
- **Boundary:** a utility-scale model is not a turnkey rooftop model. US tax structures, PPA assumptions and financial defaults are not transferred to Thailand. The media does not assert a universal DSCR threshold, warranty or debt commitment.

### com-present-value

- **Exact title:** Introduction to present value | Interest and debt | Finance & Capital Markets | Khan Academy
- **Video:** [Khan Academy present-value introduction](https://www.youtube.com/watch?v=ks33lMoxst0)
- **Publisher/channel:** Khan Academy — [@khanacademy](https://www.youtube.com/@khanacademy)
- **Primary provenance:** [Khan Academy lesson and transcript](https://www.khanacademy.org/v/introduction-to-present-value?playlist=Finance) credits Sal Khan; official YouTube search metadata and oEmbed identify the exact English video.
- **Verified subject:** valuing money received at different dates. Used for the timing component of `finance-07`.
- **Boundary:** the video is not FX forecasting or Thai tax instruction. The diagram's hypothetical 35/36 THB/USD comparison comes from the Bustan lesson, not this video, and is not a current exchange quotation.

### com-discounted-cash-flow

- **Exact title:** Present Value 4 (and discounted cash flow) | Finance & Capital Markets | Khan Academy
- **Video:** [Khan Academy discounted cash flow](https://www.youtube.com/watch?v=6WCfVjUTTEY)
- **Publisher/channel:** Khan Academy — [@khanacademy](https://www.youtube.com/@khanacademy)
- **Primary provenance:** [Khan Academy lesson](https://www.khanacademy.org/economics-finance-domain/core-finance/interest-tutorial/present-value/v/present-value-4-and-discounted-cash-flow) and the official YouTube description identify the subject; oEmbed confirms exact title/channel.
- **Verified subject:** discount rates and dated cash flows. Used for `finance-05`.
- **Boundary:** the two-year THB example is original Bustan training content. The 10% rate is illustrative and is neither an investment recommendation nor a forecast.

### com-discovery-questions

- **Exact title:** Sales Training: The Science of Asking High Gain Questions
- **Video:** [HubSpot Academy masterclass](https://www.youtube.com/watch?v=jK6cASnCQME)
- **Publisher/channel:** HubSpot — [@HubSpot-CRM](https://www.youtube.com/@HubSpot-CRM)
- **Primary provenance:** [HubSpot's official masterclass page and transcript](https://certification.hubspot.com/master-class/sales-training-david-hoffeld) embeds the exact ID and identifies David Hoffeld and HubSpot Academy's Kyle Jepson.
- **Verified subject:** purposeful sales questions. Used for `sales-01`, `sales-03`, `sales-04`, `sales-09`, `sales-bd-01`, `sales-bd-02`; each has a distinct application prompt from the relevant lesson.
- **Boundary:** the Bustan stakeholder map, survey gate, backup exclusions and handover controls are lesson-specific applications. The webinar does not establish solar suitability, local contracting rules or an implemented CRM integration.

### com-negotiation

- **Exact title:** Stanford Webinar - Negotiation: How to Get (More of) What You Want
- **Video:** [Stanford Online webinar](https://www.youtube.com/watch?v=7XTlcCvgijI)
- **Publisher/channel:** Stanford Online — [@stanfordonline](https://www.youtube.com/@stanfordonline)
- **Primary provenance:** the official Stanford Online video description names Professor Margaret A. Neale and the topic; oEmbed confirms the ID and exact title/channel. [Stanford faculty profile](https://www.gsb.stanford.edu/faculty-research/faculty/margaret-neale) independently identifies the educator's role.
- **Verified subject:** evaluating negotiation outcomes and avoiding common mistakes. Used for `sales-06`, `sales-07`, `sales-08`, `sales-bd-03`.
- **Boundary:** educational negotiation is not pressure to close an unsuitable sale, a contract opinion or a guaranteed commercial result. The proposal-normalization and contribution examples come from the Bustan lessons.

## Lesson-specific numerical and content checks

- `sales-02`: 3,000 kWh/month room meter plus 2,000 kitchen meter is 5,000 total business consumption, but the proposed connection remains rooms only.
- `sales-06`: Quote B 280,000 + confirmed access 25,000 = 305,000 THB versus A 300,000; the adjustment is labelled and does not overwrite the original price.
- `sales-08`: 400,000 − 320,000 = 80,000 THB contribution; 10% price reduction leaves 360,000 − 320,000 = 40,000. Not net profit.
- `finance-01`: 12 kWh generation = 8 direct use + 4 surplus in the explicitly defined PV-only hour. Surplus compensation stays unverified.
- `finance-02`: 12,000 − 8,000 − 500 = 3,500 THB monthly operating benefit, excluding export, tax and debt.
- `finance-03`: conceptual billing flow intentionally repeats no universal numerical tariff or VAT rate.
- `finance-04`: 300,000 CAPEX, 10,000 annual OPEX and 80,000 assumed year-eight replacement retain the training assumptions; no equipment-life promise.
- `finance-05`: −100,000 + 60,000/1.10 + 60,000/1.10² = 4,132.23 THB NPV, displayed approximately 4,132.
- `finance-06`: 120,000/100,000 = 1.20; 80,000/100,000 = 0.80; downside gap 20,000 THB.
- `finance-07`: USD 20,000 × 35 = 700,000 THB; × 36 = 720,000; difference 20,000. Hypothetical rates, fees/tax excluded.
- `finance-08`: 150,000 − 30,000 = 120,000; 100,000 − 40,000 = 60,000. Two changed inputs constitute a scenario, not a one-variable sensitivity.
- `finance-09`: 300,000 proposed debt + 300,000 proposed equity = 600,000 uses; 144,000/96,000 = 1.50; 72,000/96,000 = 0.75; downside gap 24,000. Funding remains uncommitted.
- Legacy packs teach stakeholder discovery, evidence gates, ownership/payment comparison and economic-model boundaries without recycling historical project figures as current offers.

## Validation completed

Valid JSON; exactly 22 unique expected lesson IDs; all eight video references resolve; all text objects contain English/Hebrew/Thai; all diagrams have three or four nodes. English labels are at most five words, details at most twelve. English and Hebrew captions are within 25–55 whitespace-separated words; Thai is authored as normal Thai sentences rather than artificially spaced to satisfy an English word counter. Every bars diagram has numerical values and a labelled unit. Decision diagrams begin with a question. No third-party footage was downloaded, edited or republished.
