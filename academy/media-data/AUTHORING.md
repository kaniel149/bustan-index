# Visual lesson packs

All 86 lessons receive a specific original diagram and a relevant verified expert video, with trilingual learning guidance. External video speech remains its original language, explicitly labelled; do not claim translated audio or captions that were not verified.

Bundle: `{ videos: [Video], lessons: [Pack] }`.
T = `{en:string, he:string, th:string}`. Keep labels short for mobile.

Video = `{id: "slug", youtubeId: "11 characters", title: "exact original title", publisher: "actual channel", language: "en"|"th"|"he", url:"https://www.youtube.com/watch?v=...", verified:"2026-09-07", evidenceUrl:"primary source page or video page", description:T}`.
Use verified real video IDs and metadata, primary educators/manufacturers/authorities. Verify via web search/open + YouTube oEmbed GET where available; document official channel provenance. Do not invent duration, contents, timestamps, availability, translation, or publication date. No downloading or modifying third-party footage.

Pack = `{lesson: "foundation-01", diagram: {kind:"flow"|"compare"|"bars"|"decision"|"cycle", title:T, nodes:[{label:T,detail:T,value?:number}], unit?:T, caption:T, alt:T}, videoId:"registered-id", watchFor:T, takeaway:T, question:T}`.
For earlier lessons use their existing slug, e.g. technical-01 / solar-fundamentals-01. Drawings will be generated as labelled SVG images in all three languages.
Use 3–4 nodes, labels ≤5 English words, details ≤12 English words, correspondingly concise Hebrew/Thai. Bars must have numeric values and a unit, from the lesson's labelled training example, not an invented field claim. Other types show actual relationships/alternatives/decisions. `decision`: first node is the question, remaining three are alternative outcomes/conditions. `compare`: two to four alternatives. `flow`/`cycle`: three/four connected stages. Caption 25–55 words/language explains the relationship and any example/model boundary. Alt explains meaningful image content. Avoid repeated generic diagrams; each pack must teach the particular lesson. No installation schematics, prescriptive universal electrical settings, made-up laws/tariffs, or professional certification claims.
watchFor/takeaway/question must relate this specific lesson to the video's actual subject; translated into EN/HE/TH. Label illustrative product videos as model-specific in description. A curated video may be reused when genuinely relevant; aim for variety rather than repeat one video across a role. Research source ledgers remain valid; do not alter previous lesson text.
