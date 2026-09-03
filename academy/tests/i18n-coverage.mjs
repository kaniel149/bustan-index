// academy/tests/i18n-coverage.mjs — every text block in a lesson must have he+th
import { htmlIn, read, fail } from './_util.mjs';
export const BLOCK = /<(p|li|td|th|h2|h3|h4|blockquote|figcaption)\b([^>]*)>([\s\S]*?)<\/\1>/g;
export const TITLE = /<title([^>]*)>([^<]*)<\/title>/;
// ranges of elements that carry data-(en|he|th) themselves — anything nested inside is translated via the ancestor
// (older lessons use <ul data-en>…</ul><ul data-he>…</ul>, <table data-en>…, etc.)
export function coveredRanges(body) {
  const ranges = [];
  for (const m of body.matchAll(/<([a-z0-9]+)\b[^>]*\sdata-(?:en|he|th)\b[^>]*>/g)) {
    const tag = m[1]; if (/^(img|br|input|hr|meta|link)$/.test(tag)) continue;
    const re = new RegExp(`<(\\/?)${tag}\\b[^>]*>`, 'g'); re.lastIndex = m.index + m[0].length;
    let depth = 1, x;
    while ((x = re.exec(body))) { depth += x[1] ? -1 : 1; if (!depth) { ranges.push([m.index, x.index]); break; } }
  }
  return ranges;
}
export function gaps(html) {
  const body = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '');
  const out = [], covered = coveredRanges(body);
  for (const m of body.matchAll(BLOCK)) {
    const [whole, tag, attrs, inner] = m;
    if (/\sdata-(en|he|th)\b/.test(attrs) || /\sdata-(en|he|th)\b/.test(inner)) continue; // translated (sibling or span pattern)
    if (covered.some(([a, b]) => m.index > a && m.index < b)) continue; // translated via ancestor
    const text = inner.replace(/<[^>]+>/g, '').trim();
    if (!/[A-Za-z]{4,}/.test(text)) continue; // numbers / symbols only
    out.push({ tag, whole, inner, text });
  }
  const t = body.match(TITLE);
  if (t && !/data-he=/.test(t[1])) out.push({ tag: 'title', whole: t[0], inner: t[2], text: t[2] });
  return out;
}
if (process.argv[1].endsWith('i18n-coverage.mjs')) {
  let total = 0;
  for (const f of htmlIn('academy/courses')) { const g = gaps(read(f)); total += g.length; for (const x of g) fail(`${f}: <${x.tag}> "${x.text.slice(0, 60)}"`); }
  console.log(`i18n-coverage: ${total} untranslated blocks`);
}
