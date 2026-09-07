// Content and artifact contract for all academy visual/video packs; no browser or network needed.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { rel, read, htmlIn, LESSON_RE } from './_util.mjs';

const LANGS = ['en', 'he', 'th'];
const REVIEW_DATE = '2026-09-07';
const BUNDLES = ['foundation', 'technical', 'commercial', 'planning-management'];
const bundleFiles = fs.readdirSync(rel('academy/media-data')).filter(name => name.endsWith('.json') && name !== 'catalog.json').sort();
assert.deepEqual(bundleFiles, BUNDLES.map(name => `${name}.json`).sort(), 'media source bundles');
const bundles = BUNDLES.map(name => ({ name, ...JSON.parse(read(`academy/media-data/${name}.json`)) }));
const videos = new Map();
const packs = new Map();
let translatedStrings = 0;

function translated(value, where) {
  assert.ok(value && typeof value === 'object' && !Array.isArray(value), `${where}: translation object`);
  assert.deepEqual(Object.keys(value).sort(), [...LANGS].sort(), `${where}: exact EN/HE/TH keys`);
  for (const lang of LANGS) {
    assert.equal(typeof value[lang], 'string', `${where}.${lang}: string`);
    assert.ok(value[lang].trim(), `${where}.${lang}: nonempty`);
    translatedStrings++;
  }
  assert.ok(!/[\u0e00-\u0e7f]/.test(value.he), `${where}: Thai text leaked into Hebrew`);
  assert.ok(!/[\u0590-\u05ff]/.test(value.th), `${where}: Hebrew text leaked into Thai`);
}
function httpsUrl(value, where) {
  assert.equal(typeof value, 'string', `${where}: URL string`);
  const url = new URL(value);
  assert.equal(url.protocol, 'https:', `${where}: HTTPS`);
  assert.ok(url.hostname && !url.username && !url.password, `${where}: public URL without credentials`);
  return url;
}
for (const bundle of bundles) {
  assert.ok(Array.isArray(bundle.videos) && Array.isArray(bundle.lessons), `${bundle.name}: source arrays`);
  for (const video of bundle.videos) {
    const where = `${bundle.name}/${video.id}`;
    assert.match(video.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `${where}: registry ID`);
    assert.ok(!videos.has(video.id), `${where}: duplicate videoId definition`);
    assert.match(video.youtubeId, /^[A-Za-z0-9_-]{11}$/, `${where}: YouTube ID`);
    for (const key of ['title', 'publisher']) assert.ok(typeof video[key] === 'string' && video[key].trim(), `${where}.${key}`);
    assert.ok(LANGS.includes(video.language), `${where}: original audio language`);
    const url = httpsUrl(video.url, `${where}.url`);
    assert.equal(url.hostname, 'www.youtube.com', `${where}: source video host`);
    assert.equal(url.pathname, '/watch', `${where}: source watch URL`);
    assert.equal(url.searchParams.get('v'), video.youtubeId, `${where}: URL/ID agreement`);
    assert.equal(url.searchParams.getAll('v').length, 1, `${where}: one source ID`);
    httpsUrl(video.evidenceUrl, `${where}.evidenceUrl`);
    assert.match(video.verified, /^\d{4}-\d{2}-\d{2}$/, `${where}: verification date format`);
    assert.equal(new Date(`${video.verified}T00:00:00Z`).toISOString().slice(0, 10), video.verified, `${where}: real calendar date`);
    assert.equal(video.verified, REVIEW_DATE, `${where}: current media review date`);
    translated(video.description, `${where}.description`);
    videos.set(video.id, video);
  }
  for (const pack of bundle.lessons) {
    const where = `${bundle.name}/${pack.lesson}`;
    assert.match(pack.lesson, /^[a-z]+(?:-[a-z]+)*-\d{2}$/, `${where}: lesson slug`);
    assert.ok(!packs.has(pack.lesson), `${where}: duplicate lesson slug`);
    for (const key of ['watchFor', 'takeaway', 'question']) translated(pack[key], `${where}.${key}`);
    const diagram = pack.diagram;
    assert.ok(diagram && typeof diagram === 'object', `${where}: diagram`);
    assert.ok(['flow', 'compare', 'bars', 'decision', 'cycle'].includes(diagram.kind), `${where}: diagram kind`);
    for (const key of ['title', 'alt', 'caption']) translated(diagram[key], `${where}.diagram.${key}`);
    assert.ok(Array.isArray(diagram.nodes) && diagram.nodes.length >= 3 && diagram.nodes.length <= 4, `${where}: 3–4 diagram nodes`);
    if (diagram.kind === 'decision') assert.equal(diagram.nodes.length, 4, `${where}: question and three alternatives`);
    for (const [index, node] of diagram.nodes.entries()) {
      translated(node.label, `${where}.nodes[${index}].label`);
      translated(node.detail, `${where}.nodes[${index}].detail`);
      assert.ok(node.label.en.trim().split(/\s+/).length <= 5, `${where}.nodes[${index}]: short English label`);
      assert.ok(node.detail.en.trim().split(/\s+/).length <= 12, `${where}.nodes[${index}]: short English detail`);
      if (diagram.kind === 'bars') assert.ok(Number.isFinite(node.value) && node.value >= 0, `${where}.nodes[${index}]: finite nonnegative bar value`);
    }
    if (diagram.kind === 'bars' || diagram.unit !== undefined) translated(diagram.unit, `${where}.diagram.unit`);
    // Thai is not whitespace-delimited; its completeness is checked above and in generated SVGs.
    for (const lang of ['en', 'he']) {
      const words = diagram.caption[lang].trim().split(/\s+/).length;
      assert.ok(words >= 25 && words <= 55, `${where}.caption.${lang}: 25–55 words, received ${words}`);
    }
    packs.set(pack.lesson, pack);
  }
}
assert.ok(videos.size > 0, 'verified video registry is populated');
const usedVideos = new Set();
for (const pack of packs.values()) {
  assert.ok(videos.has(pack.videoId), `${pack.lesson}: unresolved video reference ${pack.videoId}`);
  usedVideos.add(pack.videoId);
}
assert.deepEqual([...usedVideos].sort(), [...videos.keys()].sort(), 'no unused video definitions');

// Derive coverage independently from curriculum sources and the legacy lesson manifest.
const expected = new Map();
for (const name of BUNDLES) {
  const curriculum = JSON.parse(read(`academy/curriculum/${name}.json`));
  for (const track of curriculum.tracks) for (const lesson of track.lessons) {
    const slug = `${track.id}-${String(lesson.num).padStart(2, '0')}`;
    assert.ok(!expected.has(slug), `${slug}: duplicate curriculum identity`);
    expected.set(slug, `academy/learning/${slug}.html`);
  }
}
assert.equal(expected.size, 62, '62 role/foundation learning lessons');
assert.deepEqual(htmlIn('academy/learning').sort(), [...expected.values()].sort(), 'learning directory matches curriculum');
const manifestContext = { window: {} };
vm.runInNewContext(read('academy/assets/lessons.js'), manifestContext, { filename: 'academy/assets/lessons.js' });
const legacy = manifestContext.window.ACADEMY_LESSONS;
assert.ok(Array.isArray(legacy), 'legacy manifest array');
assert.equal(legacy.length, 24, '24 legacy courses');
for (const lesson of legacy) {
  assert.ok(LESSON_RE.test(`${lesson.slug}.html`), `${lesson.slug}: legacy identity`);
  assert.equal(lesson.file, `courses/${lesson.slug}.html`, `${lesson.slug}: legacy file`);
  assert.ok(!expected.has(lesson.slug), `${lesson.slug}: duplicate manifest identity`);
  expected.set(lesson.slug, `academy/${lesson.file}`);
}
assert.deepEqual(htmlIn('academy/courses').sort(), Array.from(legacy, lesson => `academy/${lesson.file}`).sort(), 'legacy directory matches manifest');
assert.equal(expected.size, 86, '86 total lessons');
assert.deepEqual([...packs.keys()].sort(), [...expected.keys()].sort(), 'exact media coverage: no missing or extra lessons');

function decode(value) {
  const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", '#39': "'", nbsp: '\u00a0' };
  return value.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (whole, entity) => {
    if (entity[0] === '#') return String.fromCodePoint(parseInt(entity.slice(entity[1].toLowerCase() === 'x' ? 2 : 1), entity[1].toLowerCase() === 'x' ? 16 : 10));
    return named[entity.toLowerCase()] ?? whole;
  });
}
function textContent(markup) { return decode(markup.replace(/<[^>]*>/g, '')).replace(/\s+/g, ''); }
function tags(markup) {
  const clean = markup.replace(/<!--[^]*?-->/g, '').replace(/(<(?:script|style)\b[^>]*>)[^]*?(<\/(?:script|style)>)/gi, '$1$2');
  return [...clean.matchAll(/<([a-z][\w:-]*)\b((?:"[^"]*"|'[^']*'|[^'">])*)>/gi)].map(match => {
    const attrs = {};
    for (const attr of match[2].matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) attrs[attr[1].toLowerCase()] = decode(attr[2] ?? attr[3] ?? attr[4] ?? '');
    return { tag: match[1].toLowerCase(), attrs };
  });
}
function hasClass(tag, name) { return (tag.attrs.class || '').split(/\s+/).includes(name); }
function one(items, where) { assert.equal(items.length, 1, `${where}: expected exactly one, received ${items.length}`); return items[0]; }
function markedBlock(html, kind, where) {
  const start = `<!-- BUSTAN ${kind} START -->`, end = `<!-- BUSTAN ${kind} END -->`;
  assert.equal(html.split(start).length - 1, 1, `${where}: one ${kind} start marker`);
  assert.equal(html.split(end).length - 1, 1, `${where}: one ${kind} end marker`);
  const a = html.indexOf(start), b = html.indexOf(end);
  assert.ok(b > a, `${where}: ordered ${kind} markers`);
  return html.slice(a + start.length, b);
}
function containsTranslation(markup, value, where) {
  for (const lang of LANGS) {
    const spans = [...markup.matchAll(new RegExp(`<([a-z][\\w:-]*)\\b[^>]*\\sdata-${lang}(?:\\s|=|>)[^]*?<\\/\\1>`, 'gi'))].map(m => textContent(m[0]));
    assert.ok(spans.some(s => s.includes(value[lang].replace(/\s+/g, ''))), `${where}.${lang}: translated text missing from generated block`);
  }
}
function localAsset(ref, htmlFile, where) {
  assert.ok(ref && !/^(?:[a-z]+:|\/\/)/i.test(ref), `${where}: local asset reference`);
  const resolved = path.resolve(path.dirname(rel(htmlFile)), decodeURIComponent(ref.split(/[?#]/)[0]));
  assert.ok(resolved.startsWith(rel('academy') + path.sep), `${where}: asset stays within academy`);
  assert.ok(fs.existsSync(resolved) && fs.statSync(resolved).isFile(), `${where}: missing asset ${ref}`);
  return resolved;
}

const expectedSvgs = [];
let checkedSvgs = 0;
for (const [slug, htmlFile] of expected) {
  const pack = packs.get(slug), diagram = pack.diagram, video = videos.get(pack.videoId);
  const html = read(htmlFile), allTags = tags(html);
  assert.equal(allTags.filter(t => t.tag === 'iframe').length, 0, `${slug}: no static/eager iframe embeds; video loads on request`);
  assert.ok(!allTags.some(t => hasClass(t, 'lesson-image')), `${slug}: superseded lesson-image element remains`);
  for (const tag of allTags) for (const key of ['src', 'srcset', 'href']) {
    const value = tag.attrs[key];
    if (!value) continue;
    assert.ok(!/^(?:\.\.\/images\/|\/academy\/images\/)/.test(value), `${slug}: superseded lesson image reference ${value}`);
    if (/\.\.\/media\//.test(value)) localAsset(value, htmlFile, `${slug}.${key}`);
  }
  for (const [kind, suffix] of [['link', '.css'], ['script', '.js']]) {
    const attr = kind === 'link' ? 'href' : 'src';
    const asset = one(allTags.filter(t => t.tag === kind && (t.attrs[attr] || '').split(/[?#]/)[0].endsWith(`/assets/media-learning${suffix}`)), `${slug}: media ${suffix}`);
    localAsset(asset.attrs[attr], htmlFile, `${slug}: media ${suffix}`);
  }
  const visual = markedBlock(html, 'VISUAL', slug), guided = markedBlock(html, 'VIDEO', slug);
  const visualSection = one(allTags.filter(t => t.attrs['data-media-lesson'] !== undefined), `${slug}: visual block`);
  assert.equal(visualSection.tag, 'section', `${slug}: semantic visual section`);
  assert.equal(visualSection.attrs['data-media-lesson'], slug, `${slug}: visual identity`);
  assert.equal(one(allTags.filter(t => t.attrs.id === 'visual-guide'), `${slug}: visual anchor`), visualSection);
  const videoSection = one(allTags.filter(t => t.attrs['data-video-id'] !== undefined), `${slug}: video block`);
  assert.equal(videoSection.tag, 'section', `${slug}: semantic video section`);
  assert.equal(videoSection.attrs['data-video-id'], video.youtubeId, `${slug}: correct video embed identity`);
  assert.equal(one(allTags.filter(t => t.attrs.id === 'watch-and-apply'), `${slug}: video anchor`), videoSection);
  one(allTags.filter(t => t.tag === 'figure' && hasClass(t, 'teaching-figure')), `${slug}: one teaching diagram`);
  const img = one(allTags.filter(t => t.attrs['data-diagram'] !== undefined), `${slug}: diagram image`);
  assert.equal(img.tag, 'img'); assert.equal(img.attrs['data-diagram'], slug);
  assert.equal(localAsset(img.attrs.src, htmlFile, `${slug}: desktop diagram`), rel(`academy/media/diagrams/${slug}-en.svg`));
  assert.equal(img.attrs.loading, 'lazy', `${slug}: image lazy loads`);
  assert.equal(img.attrs.alt, diagram.alt.en, `${slug}: initial English image alt`);
  for (const lang of LANGS) assert.equal(img.attrs[`data-alt-${lang}`], diagram.alt[lang], `${slug}: localized image alt ${lang}`);
  const source = one(allTags.filter(t => t.attrs['data-diagram-source'] !== undefined), `${slug}: mobile picture source`);
  assert.equal(source.tag, 'source'); assert.equal(source.attrs['data-diagram-source'], slug);
  assert.ok(/max-width/.test(source.attrs.media), `${slug}: mobile source breakpoint`);
  assert.equal(localAsset(source.attrs.srcset, htmlFile, `${slug}: mobile diagram`), rel(`academy/media/diagrams/${slug}-en-mobile.svg`));
  for (const key of ['title', 'caption']) containsTranslation(visual, diagram[key], `${slug}.visual.${key}`);
  for (const [index, node] of diagram.nodes.entries()) for (const key of ['label', 'detail']) containsTranslation(visual, node[key], `${slug}.visual.nodes[${index}].${key}`);
  for (const key of ['watchFor', 'takeaway', 'question']) containsTranslation(guided, pack[key], `${slug}.video.${key}`);
  containsTranslation(guided, video.description, `${slug}.video.description`);
  const guidedTags = tags(guided);
  const button = one(guidedTags.filter(t => t.attrs['data-play-video'] !== undefined), `${slug}: video launch button`);
  assert.equal(button.tag, 'button'); assert.equal(button.attrs.type, 'button');
  assert.ok(button.attrs['aria-label']?.includes(video.title), `${slug}: accessible video title`);
  one(guidedTags.filter(t => t.tag === 'a' && t.attrs.href === video.url), `${slug}: working external-video fallback URL`);
  assert.ok(textContent(guided).includes(video.title.replace(/\s+/g, '')), `${slug}: exact video title displayed`);
  assert.ok(textContent(guided).includes(video.publisher.replace(/\s+/g, '')), `${slug}: actual publisher displayed`);
  one(guidedTags.filter(t => t.tag === 'img' && t.attrs.src === `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`), `${slug}: thumbnail matches video`);

  for (const lang of LANGS) {
    const widths = [];
    for (const mobile of [false, true]) {
      const filename = `${slug}-${lang}${mobile ? '-mobile' : ''}.svg`;
      expectedSvgs.push(filename);
      const svg = read(`academy/media/diagrams/${filename}`), root = one(tags(svg).filter(t => t.tag === 'svg'), filename);
      assert.equal(root.attrs.xmlns, 'http://www.w3.org/2000/svg', `${filename}: SVG namespace`);
      assert.equal(root.attrs.lang, lang, `${filename}: language`);
      assert.equal(root.attrs.role, 'img', `${filename}: image semantics`);
      const labelled = (root.attrs['aria-labelledby'] || '').split(/\s+/);
      const title = svg.match(/<title\b([^>]*)>([^]*?)<\/title>/), desc = svg.match(/<desc\b([^>]*)>([^]*?)<\/desc>/);
      assert.ok(title && desc, `${filename}: accessible title and description`);
      for (const [match, expectedText] of [[title, diagram.title[lang]], [desc, diagram.alt[lang]]]) {
        const tag = tags(match[0])[0];
        assert.ok(labelled.includes(tag.attrs.id), `${filename}: aria label resolves`);
        assert.equal(decode(match[2]), expectedText, `${filename}: current localized accessible content`);
      }
      const dimensions = (root.attrs.viewbox || '').trim().split(/\s+/).map(Number);
      assert.ok(dimensions.length === 4 && dimensions.every(Number.isFinite) && dimensions[2] > 0 && dimensions[3] > 0, `${filename}: usable viewBox`);
      widths.push(dimensions[2]);
      const renderedText = textContent(svg);
      if (diagram.kind === 'bars') for (const node of diagram.nodes) assert.ok(renderedText.includes(`${node.value}${diagram.unit[lang]}`.replace(/\s+/g, '')), `${filename}: visible bar value and unit`);
      for (const [index, node] of diagram.nodes.entries()) for (const key of ['label', 'detail']) assert.ok(renderedText.includes(node[key][lang].replace(/\s+/g, '')), `${filename}: rendered node ${index} ${key}`);
      assert.ok(!tags(svg).some(t => ['script', 'iframe', 'foreignobject'].includes(t.tag)), `${filename}: standalone image content`);
      checkedSvgs++;
    }
    assert.ok(widths[1] < widths[0], `${slug}.${lang}: separate mobile layout`);
  }
}
assert.equal(checkedSvgs, 516, 'six diagrams per lesson');
const catalog = JSON.parse(read('academy/media-data/catalog.json'));
assert.equal(catalog.reviewed, REVIEW_DATE, 'generated catalog review date');
assert.equal(catalog.lessons, expected.size, 'generated catalog lesson count');
assert.equal(catalog.videos, videos.size, 'generated catalog video count');
assert.equal(catalog.diagrams, checkedSvgs, 'generated catalog diagram count');
assert.deepEqual(fs.readdirSync(rel('academy/media/diagrams')).filter(name => name.endsWith('.svg')).sort(), expectedSvgs.sort(), 'exact generated diagram inventory');

// Exercise only the exported pure URL helper; browser playback and dialogs are checked elsewhere.
const runtime = { module: { exports: {} }, URL };
vm.runInNewContext(read('academy/assets/media-learning.js'), runtime, { filename: 'academy/assets/media-learning.js' });
const { videoUrl } = runtime.module.exports;
assert.equal(typeof videoUrl, 'function', 'testable video URL helper');
const sampleId = videos.values().next().value.youtubeId;
for (const lang of LANGS) {
  const url = new URL(videoUrl(sampleId, lang, 'https://index.bustan-energy.com'));
  assert.equal(url.origin, 'https://www.youtube-nocookie.com');
  assert.equal(url.pathname, `/embed/${sampleId}`);
  assert.equal(url.searchParams.get('hl'), lang);
  assert.equal(url.searchParams.get('cc_lang_pref'), lang);
  assert.equal(url.searchParams.get('origin'), 'https://index.bustan-energy.com');
}
for (const bad of ['', 'too-short', '../bad-path', 'aaaaaaaaaaa?autoplay=1']) assert.equal(videoUrl(bad, 'en', 'https://index.bustan-energy.com'), null, 'invalid video ID rejected');
assert.equal(new URL(videoUrl(sampleId, 'xx', 'javascript:bad')).searchParams.get('hl'), 'en', 'unknown language uses English');
assert.equal(new URL(videoUrl(sampleId, 'en', 'javascript:bad')).searchParams.has('origin'), false, 'invalid origin omitted');
console.log(`media-coverage: 62 learning + 24 legacy lessons; ${videos.size} referenced videos; ${checkedSvgs} localized desktop/mobile SVGs; ${translatedStrings} translated strings; single blocks, lazy playback, current assets and URL helper passed`);
