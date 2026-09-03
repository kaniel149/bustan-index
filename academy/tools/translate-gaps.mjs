// academy/tools/translate-gaps.mjs — fill missing he/th for lesson blocks via Gemini. Idempotent + resumable.
// usage: GEMINI_API_KEY=... [GEMINI_MODEL=gemini-3.5-flash] node academy/tools/translate-gaps.mjs [--dry] [course-slug ...]
// (free tier: 5 req/min + a daily cap per model; override GEMINI_MODEL when 429s persist — the cache makes re-runs cheap)
import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto';
import { gaps } from '../tests/i18n-coverage.mjs';
const ROOT = path.resolve(new URL('.', import.meta.url).pathname, '..');
const KEY = process.env.GEMINI_API_KEY; const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'; const DRY = process.argv.includes('--dry');
const only = process.argv.slice(2).filter(a => !a.startsWith('--'));
if (!KEY && !DRY) { console.error('GEMINI_API_KEY not set'); process.exit(2); }
const cachePath = path.join(ROOT, 'i18n', 'cache.json'); fs.mkdirSync(path.dirname(cachePath), { recursive: true });
const cache = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, 'utf8')) : {};
const h = s => crypto.createHash('sha1').update(s).digest('hex');
const review = [];

const sleep = ms => new Promise(r => setTimeout(r, ms));
let lastCall = 0; const MIN_GAP_MS = 13000; // free tier: 5 requests/min
async function gemini(items) { // items: [{id, html}] -> {id: {he, th}}
  await sleep(Math.max(0, lastCall + MIN_GAP_MS - Date.now())); lastCall = Date.now();
  const prompt = `You translate solar-energy training content for Bustan Energy (Thailand). Translate each item's HTML fragment from English to Hebrew ("he") and Thai ("th").
Rules: keep ALL inline HTML tags/attributes exactly (e.g. <strong>, <a href>, <br>); keep numbers, units, currency (฿, kWp, kWh, THB), brand names, acronyms (PEA, MEA, PPA, EPC, IRR) unchanged; keep emoji; natural professional tone; no explanations.
Return ONLY JSON: {"<id>": {"he": "...", "th": "..."}, ...}
Items:\n${JSON.stringify(items, null, 1)}`;
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0.2 } }) });
  if (res.status === 429) { // quota: honour retryDelay and try again
    const body = await res.text(); const wait = Number((body.match(/retryDelay":\s*"(\d+)/) || [])[1] || 30) + 2;
    console.warn(`Gemini 429 — waiting ${wait}s`); await sleep(wait * 1000); lastCall = 0; return gemini(items);
  }
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  const j = await res.json(); return JSON.parse(j.candidates[0].content.parts[0].text);
}
async function translateAll(strings) { // strings: string[] -> fills cache
  const todo = [...new Set(strings)].filter(s => !cache[h(s)]);
  for (let i = 0; i < todo.length; i += 15) {
    const batch = todo.slice(i, i + 15).map(html => ({ id: h(html), html }));
    if (DRY) { console.log(`[dry] would translate ${batch.length} items`); continue; }
    // Gemini occasionally truncates/mangles an id key or drops an item — tolerate prefix matches, retry the batch
    let got = {}, attempt = 0;
    while (attempt++ < 3) {
      const out = await gemini(batch);
      for (const it of batch) {
        const k = out[it.id] ? it.id : Object.keys(out).find(k => it.id.startsWith(k.slice(0, 12)) || k.startsWith(it.id.slice(0, 12)));
        if (k && out[k]?.he && out[k]?.th) got[it.id] = { he: out[k].he, th: out[k].th };
      }
      if (batch.every(it => got[it.id])) break;
      console.warn(`batch attempt ${attempt}: ${batch.filter(it => !got[it.id]).length} item(s) missing, retrying`);
    }
    for (const it of batch) { if (!got[it.id]) throw new Error(`missing translation for ${it.id} after 3 attempts`); cache[it.id] = got[it.id]; }
    fs.writeFileSync(cachePath, JSON.stringify(cache, null, 1)); // resumable: saved after every batch
    console.log(`translated ${Math.min(i + 15, todo.length)}/${todo.length}`);
  }
}
const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
for (const f of fs.readdirSync(path.join(ROOT, 'courses')).filter(f => /^[a-z-]+-\d{2}\.html$/.test(f)).sort()) {
  if (only.length && !only.includes(f.replace('.html', ''))) continue;
  const p = path.join(ROOT, 'courses', f); let html = fs.readFileSync(p, 'utf8');
  const g = gaps(html); if (!g.length) { console.log(`${f}: complete`); continue; }
  await translateAll(g.map(x => x.inner.trim()));
  if (DRY) continue;
  for (const x of g) {
    const en = x.inner.trim(), tr = cache[h(en)];
    const repl = x.tag === 'title'
      ? `<title data-en="${esc(en)}" data-he="${esc(tr.he)}" data-th="${esc(tr.th)}">${en}</title>`
      : x.whole.replace(x.inner, `<span data-en>${en}</span><span data-he>${tr.he}</span><span data-th>${tr.th}</span>`);
    html = html.replace(x.whole, repl);
  }
  fs.writeFileSync(p, html); console.log(`${f}: filled ${g.length} blocks`);
}
// Regenerate the HE review queue from cache + lessons (deterministic; survives interrupted runs).
// Previously ticked items are preserved by their (file, EN) key.
if (!DRY) {
  const rp = path.join(ROOT, 'i18n', 'REVIEW_HE.md');
  const prev = fs.existsSync(rp) ? fs.readFileSync(rp, 'utf8') : '';
  const ticked = new Set([...prev.matchAll(/^- \[x\] \*\*([^*]+)\*\* .*\n  - EN: (.*)$/gm)].map(m => m[1] + '|' + m[2]));
  const strip = t => t.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').trim();
  for (const f of fs.readdirSync(path.join(ROOT, 'courses')).filter(f => /^[a-z-]+-\d{2}\.html$/.test(f)).sort()) {
    const html = fs.readFileSync(path.join(ROOT, 'courses', f), 'utf8');
    const t = html.match(/<title data-en="([^"]*)" data-he="([^"]*)"/);
    if (t && cache[h(t[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&'))]) review.push({ f, tag: 'title', en: strip(t[1]), he: strip(t[2]) });
    for (const m of html.matchAll(/<(h2|h3|h4|p|li|td|th|blockquote|figcaption)\b[^>]*><span data-en>([\s\S]*?)<\/span><span data-he>([\s\S]*?)<\/span>/g))
      if (cache[h(m[2].trim())]) review.push({ f, tag: m[1], en: strip(m[2]), he: strip(m[3]) });
  }
  const lines = review.map(r => { const en = r.en.slice(0, 120), box = ticked.has(r.f + '|' + en) ? 'x' : ' ';
    return `- [${box}] **${r.f}** \`<${r.tag}>\`\n  - EN: ${en}\n  - HE: ${r.he.slice(0, 160)}`; });
  fs.writeFileSync(rp, '# Hebrew review queue (generated by tools/translate-gaps.mjs)\n\nKaniel: tick each item after reviewing/fixing the HE span in the lesson file. Regenerated on every run; ticks are kept.\n\n' + lines.join('\n') + '\n');
  console.log(`REVIEW_HE.md: ${review.length} machine-translated HE strings queued`);
}
