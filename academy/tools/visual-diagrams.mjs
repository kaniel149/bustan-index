// Original, deterministic teaching diagrams. No installation schematics.
const esc = x => String(x ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const round = x => Math.round(x * 100) / 100;
const segmenters = new Map();
function segments(text, lang, granularity) {
  const key = `${lang}:${granularity}`;
  if (!segmenters.has(key)) segmenters.set(key, new Intl.Segmenter(lang, {granularity}));
  return [...segmenters.get(key).segment(text)].map(item => item.segment);
}

// Em advances approximate Arial/Tahoma proportions. SVG textLength fixes each
// line to this measured width, so a fallback font cannot escape its text box.
const lower = {a:.556,b:.556,c:.5,d:.556,e:.556,f:.278,g:.556,h:.556,i:.222,j:.222,k:.5,l:.222,m:.833,n:.556,o:.556,p:.556,q:.556,r:.333,s:.5,t:.278,u:.556,v:.5,w:.722,x:.5,y:.5,z:.5};
const upper = {A:.667,B:.667,C:.722,D:.722,E:.667,F:.611,G:.778,H:.722,I:.278,J:.5,K:.667,L:.556,M:.833,N:.722,O:.778,P:.667,Q:.778,R:.722,S:.667,T:.611,U:.722,V:.667,W:.944,X:.667,Y:.667,Z:.611};
function advance(text) {
  let width = 0;
  for (const cluster of segments(text, 'und', 'grapheme')) {
    if (/\p{Extended_Pictographic}/u.test(cluster)) { width += 1.35; continue; }
    for (const char of cluster) {
      if (/[\p{Mark}\p{Cf}]/u.test(char)) continue;
      if (/\s/u.test(char)) width += .28;
      else if (lower[char]) width += lower[char];
      else if (upper[char]) width += upper[char];
      else if (/[0-9]/.test(char)) width += .556;
      else if (/[.,:;'!|]/.test(char)) width += .28;
      else if (/[-–()[\]{}\/]/.test(char)) width += .4;
      else if (/[MW@%]/.test(char)) width += .95;
      else if (/[\u0e40-\u0e44]/u.test(char)) width += char === 'แ' ? .48 : .29;
      else if (/[\u0e30\u0e32\u0e45]/u.test(char)) width += .43;
      else if (/\p{Script=Thai}/u.test(char)) width += .64;
      else if (/\p{Script=Hebrew}/u.test(char)) width += /[יוך]/u.test(char) ? .36 : .65;
      else width += .8;
    }
  }
  return width;
}

function wrapByWidth(text, lang, maxWidth, size = 1, weight = 400) {
  if (!Number.isFinite(maxWidth) || maxWidth <= 0) throw new RangeError('Text width must be positive.');
  const scale = size * (weight >= 700 ? 1.04 : 1);
  const widthOf = value => advance(value) * scale;
  const lines = [];
  for (const paragraph of String(text ?? '').split(/\r\n?|\n|\u2028|\u2029/u)) {
    let line = '';
    const push = () => { lines.push(line.trimEnd()); line = ''; };
    for (let word of segments(paragraph, lang, 'word')) {
      if (!line) word = word.trimStart();
      if (!word) continue;
      if (widthOf(line + word) <= maxWidth) { line += word; continue; }
      if (line.trim()) push();
      word = word.trimStart();
      if (widthOf(word) <= maxWidth) { line = word; continue; }
      // A long model name, URL or unspaced token must still fit. Never split a
      // Thai combining sequence, surrogate pair or emoji grapheme.
      for (const grapheme of segments(word, lang, 'grapheme')) {
        if (line && widthOf(line + grapheme) > maxWidth) push();
        line += grapheme;
      }
    }
    if (line || !paragraph.trim()) push();
  }
  if (!lines.length) lines.push('');
  return lines.map(value => ({value, width: Math.min(maxWidth, widthOf(value))}));
}

// The public limit remains a count of average character columns. Internally all
// layout uses pixel widths instead of assuming equal-width letters.
export function wrapText(text, lang, limit) {
  return wrapByWidth(text, lang, limit * .6).map(line => line.value);
}

export function renderDiagram(d, lang, {mobile = false} = {}) {
  const width = mobile ? 480 : 1040;
  const rtl = lang === 'he';
  const n = d.nodes.length;
  if (!n) throw new RangeError('A diagram needs at least one node.');
  const paper = '#f4ead8', shell = '#fff4e2', grove = '#24463e', lagoon = '#006f6b', sun = '#f2b84b';
  const margin = mobile ? 28 : 40;
  const titleSize = mobile ? 26 : 30;
  const title = block(d.title[lang], width - 2 * margin, titleSize, 700);
  const titleY = 53;
  const contentY = titleY + title.height + 30;
  let height, body = '';

  function block(value, maxWidth, size, weight = 400) {
    const lineHeight = Math.ceil(size * (lang === 'th' ? 1.6 : 1.45));
    const lines = wrapByWidth(value, lang, maxWidth, size, weight);
    return {lines, size, weight, lineHeight, height: lines.length * lineHeight};
  }
  function text(b, x, top, {color = grove, anchor = 'middle', direction = rtl ? 'rtl' : 'ltr'} = {}) {
    return `<text x="${round(x)}" y="${round(top + b.size)}" fill="${color}" font-family="Arial,Tahoma,sans-serif" font-size="${b.size}" font-weight="${b.weight}" text-anchor="${anchor}" direction="${direction}" unicode-bidi="plaintext">${b.lines.map((line, i) => `<tspan x="${round(x)}" y="${round(top + b.size + i * b.lineHeight)}"${line.width > 0 ? ` textLength="${round(line.width)}" lengthAdjust="spacingAndGlyphs"` : ''}>${esc(line.value)}</tspan>`).join('')}</text>`;
  }
  const path = (points, arrow = true) => `<path d="${points}" stroke="${lagoon}" stroke-width="3" fill="none"${arrow ? ' marker-end="url(#arrow)"' : ''}/>`;
  const arrow = (x1, y1, x2, y2) => path(`M${round(x1)} ${round(y1)} L${round(x2)} ${round(y2)}`);
  function plan(node, i, w) {
    const pad = mobile ? 24 : 20;
    const index = block(String(i + 1).padStart(2, '0'), w - 2 * pad, 19, 700);
    const label = block(node.label[lang], w - 2 * pad, 27, 700);
    const detail = block(node.detail[lang], w - 2 * pad, mobile ? 22 : 21);
    const indexY = 20;
    const labelY = indexY + index.height + 10;
    const detailY = labelY + label.height + 12;
    return {node, i, w, index, label, detail, indexY, labelY, detailY, h: Math.max(180, detailY + detail.height + 24)};
  }
  function card(p, x, y, h = p.h) {
    return `<g class="diagram-card" data-node="${p.i}"><rect x="${round(x)}" y="${round(y)}" width="${round(p.w)}" height="${round(h)}" rx="5" fill="${shell}" stroke="#b9c6b6" stroke-width="1.5"/><rect x="${round(x)}" y="${round(y)}" width="${round(p.w)}" height="7" fill="${p.i % 2 ? lagoon : grove}"/>${text(p.index, x + p.w / 2, y + p.indexY, {color: lagoon, direction: 'ltr'})}${text(p.label, x + p.w / 2, y + p.labelY)}${text(p.detail, x + p.w / 2, y + p.detailY, {color: '#4a5d52'})}</g>`;
  }

  if (d.kind === 'bars') {
    const values = d.nodes.map(node => node.value);
    if (!values.every(Number.isFinite)) throw new TypeError('Every bar must have a finite numeric value.');
    const min = Math.min(0, ...values), max = Math.max(0, ...values);
    const range = max - min || 1, barW = width - 2 * margin;
    const position = value => rtl ? width - margin - (value - min) / range * barW : margin + (value - min) / range * barW;
    const zero = position(0), labelX = rtl ? width - margin : margin;
    let y = contentY;
    d.nodes.forEach((node, i) => {
      const label = block(node.label[lang], barW, mobile ? 25 : 27, 700);
      const value = block(`${node.value}${d.unit?.[lang] ? ` ${d.unit[lang]}` : ''}`, barW, 20, 700);
      const detail = block(node.detail[lang], barW, 21);
      const valueY = y + label.height + 6;
      const barY = valueY + value.height + 12;
      const detailY = barY + 28 + 10;
      // SVG start means the right edge under RTL; using end here would push
      // Hebrew labels outside the viewport. Values never share the bar lane.
      body += `<g class="diagram-bar" data-node="${i}">${text(label, labelX, y, {anchor: 'start'})}${text(value, labelX, valueY, {anchor: 'start', color: lagoon})}<rect x="${margin}" y="${barY}" width="${barW}" height="28" rx="3" fill="#dedfce"/><rect x="${round(Math.min(zero, position(node.value)))}" y="${barY}" width="${round(Math.abs(position(node.value) - zero))}" height="28" rx="3" fill="${i % 2 ? lagoon : grove}"/>${min < 0 ? path(`M${round(zero)} ${barY - 3} V${barY + 31}`, false) : ''}${text(detail, labelX, detailY, {anchor: 'start', color: '#4a5d52'})}</g>`;
      y = detailY + detail.height + 30;
    });
    height = y + 10;
  } else if (d.kind === 'decision' && n > 1) {
    const questionW = mobile ? 420 : 540;
    const question = plan(d.nodes[0], 0, questionW);
    const questionX = (width - questionW) / 2;
    body += card(question, questionX, contentY);
    if (mobile) {
      const childX = rtl ? 28 : 56, childW = 396, trunkX = rtl ? width - 16 : 16;
      const children = d.nodes.slice(1).map((node, i) => plan(node, i + 1, childW));
      let y = contentY + question.h + 32;
      const placed = children.map(p => { const item = {p, y}; y += p.h + 26; return item; });
      const questionEdge = rtl ? questionX + questionW + 3 : questionX - 3;
      body += path(`M${questionEdge} ${contentY + question.h / 2} H${trunkX} V${placed.at(-1).y + placed.at(-1).p.h / 2}`, false);
      for (const {p, y: childY} of placed) {
        body += arrow(trunkX, childY + p.h / 2, rtl ? childX + childW + 8 : childX - 8, childY + p.h / 2);
        body += card(p, childX, childY);
      }
      height = y + 10;
    } else {
      const count = n - 1, gap = 32, w = (width - 2 * margin - gap * (count - 1)) / count;
      const children = d.nodes.slice(1).map((node, i) => plan(node, i + 1, w));
      const rowH = Math.max(...children.map(p => p.h));
      const y = contentY + question.h + 68, busY = y - 34;
      body += path(`M${width / 2} ${contentY + question.h + 3} V${busY}`, false);
      children.forEach((p, i) => {
        const x = margin + (rtl ? count - 1 - i : i) * (w + gap);
        body += path(`M${width / 2} ${busY} H${round(x + w / 2)} V${y - 9}`);
        body += card(p, x, y, rowH);
      });
      height = y + rowH + 36;
    }
  } else if (d.kind === 'cycle' && !mobile && (n === 3 || n === 4)) {
    const w = 420, left = 50, right = width - 50 - w;
    const plans = d.nodes.map((node, i) => plan(node, i, w));
    const rowH = Math.max(...plans.map(p => p.h));
    const top = contentY, bottom = top + rowH + 72;
    const firstX = rtl ? right : left, secondX = rtl ? left : right;
    const positions = n === 4 ? [[firstX, top], [secondX, top], [secondX, bottom], [firstX, bottom]] : [[firstX, top], [secondX, top], [(width - w) / 2, bottom]];
    const middle = top + rowH / 2;
    body += rtl ? arrow(firstX - 4, middle, secondX + w + 9, middle) : arrow(firstX + w + 4, middle, secondX - 9, middle);
    if (n === 4) {
      body += arrow(secondX + w / 2, top + rowH + 4, secondX + w / 2, bottom - 9);
      body += rtl ? arrow(secondX + w + 4, bottom + rowH / 2, firstX - 9, bottom + rowH / 2) : arrow(secondX - 4, bottom + rowH / 2, firstX + w + 9, bottom + rowH / 2);
      body += arrow(firstX + w / 2, bottom - 4, firstX + w / 2, top + rowH + 9);
    } else {
      const centerX = width / 2, returnX = rtl ? width - 20 : 20;
      body += path(`M${secondX + w / 2} ${top + rowH + 4} V${bottom - 36} H${centerX} V${bottom - 9}`);
      const thirdEdge = rtl ? positions[2][0] + w + 4 : positions[2][0] - 4;
      const firstEdge = rtl ? firstX + w + 9 : firstX - 9;
      body += path(`M${thirdEdge} ${bottom + rowH / 2} H${returnX} V${middle} H${firstEdge}`);
    }
    positions.forEach(([x, y], i) => { body += card(plans[i], x, y, rowH); });
    height = bottom + rowH + 36;
  } else if (mobile) {
    const isCycle = d.kind === 'cycle';
    const x = isCycle ? 40 : margin, w = width - 2 * x;
    const plans = d.nodes.map((node, i) => plan(node, i, w));
    let y = contentY;
    const placed = plans.map(p => { const item = {p, y}; y += p.h + (d.kind === 'compare' ? 20 : 38); return item; });
    placed.forEach(({p, y: cardY}, i) => {
      body += card(p, x, cardY);
      if (i < n - 1 && d.kind !== 'compare') body += arrow(width / 2, cardY + p.h + 4, width / 2, placed[i + 1].y - 9);
    });
    if (isCycle && n > 1) {
      const first = placed[0], last = placed.at(-1), lane = rtl ? 16 : width - 16;
      const edge = rtl ? x - 4 : x + w + 4, end = rtl ? x - 9 : x + w + 9;
      body += path(`M${edge} ${last.y + last.p.h / 2} H${lane} V${first.y + first.p.h / 2} H${end}`);
    }
    height = y + 2;
  } else {
    const gap = 32, w = (width - 2 * margin - (n - 1) * gap) / n;
    const plans = d.nodes.map((node, i) => plan(node, i, w));
    const rowH = Math.max(...plans.map(p => p.h));
    plans.forEach((p, i) => {
      const x = margin + (rtl ? n - 1 - i : i) * (w + gap);
      body += card(p, x, contentY, rowH);
      if (i < n - 1 && d.kind !== 'compare') body += rtl ? arrow(x - 4, contentY + rowH / 2, x - gap + 9, contentY + rowH / 2) : arrow(x + w + 4, contentY + rowH / 2, x + w + gap - 9, contentY + rowH / 2);
    });
    height = contentY + rowH + 36;
  }
  height = Math.ceil(height);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" lang="${esc(lang)}" xml:lang="${esc(lang)}" role="img" aria-labelledby="title desc"><title id="title">${esc(d.title[lang])}</title><desc id="desc">${esc(d.alt[lang])}</desc><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="${lagoon}"/></marker></defs><rect width="100%" height="100%" rx="8" fill="${paper}"/><path d="M24 32 H${width - 24}" stroke="${sun}" stroke-width="5"/>${text(title, width / 2, titleY)}${body}</svg>\n`;
}
