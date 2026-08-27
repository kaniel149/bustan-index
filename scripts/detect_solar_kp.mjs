#!/usr/bin/env node
/**
 * detect_solar_kp.mjs — find which Ko Phangan roofs ALREADY have solar.
 *
 * Reads roof-scanner/buildings_data.js (the dataset kp-solar-pro.html renders),
 * pulls Esri World Imagery over each building, and asks Gemini whether PV panels
 * are visible. Writes roof-scanner/solar_detected.json, which the map uses to
 * drop those buildings from the prospect layer.
 *
 * Why this exists rather than reusing api/cron-detect-solar.ts:
 *   - That cron hardcodes TILE_ZOOM = 19. Esri answers HTTP 200 at z19 over Ko
 *     Phangan but returns a ~2.5 KB "no data available" placeholder, not imagery
 *     (real z18 tile here is ~13 KB). It has been feeding Gemini blank squares.
 *     This script requests z18 and rejects any tile small enough to be the
 *     placeholder, so a bad tile is skipped rather than silently scored.
 *   - It writes to bustan.scan_candidates on a different Supabase project than
 *     the one holding these buildings, so its results never reach this map.
 *
 * Resumable: re-running skips buildings already in the output file.
 *
 * Usage:  GEMINI_API_KEY=... node scripts/detect_solar_kp.mjs [--limit N]
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const IN_FILE = join(ROOT, 'roof-scanner', 'buildings_data.js')
const OUT_FILE = join(ROOT, 'roof-scanner', 'solar_detected.json')

const GEMINI_KEY = process.env.GEMINI_API_KEY
if (!GEMINI_KEY) { console.error('GEMINI_API_KEY not set'); process.exit(1) }

const TILE_ZOOM = 18          // highest zoom Esri actually images over Ko Phangan
const MIN_TILE_BYTES = 4000   // below this it is the "no data" placeholder
const CONCURRENCY = 3        // free-tier Gemini 429s hard above this
const SAVE_EVERY = 25

const argLimit = process.argv.indexOf('--limit')
const LIMIT = argLimit > -1 ? parseInt(process.argv[argLimit + 1], 10) : Infinity

// gemini-2.5-flash-lite is RETIRED (404: "no longer available") — it is still
// first in the chain in bustan-energy/api/cron-detect-solar.ts and
// api/_lib/find-contact-core.ts, which burn a failed call on every request.
// Verified 2026-08-24: 3.1-flash-lite returns clean unfenced JSON, 3.5-flash-lite
// wraps in ```json fences (parseVerdict handles both), 2.5-flash still works.
const MODELS = ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-2.5-flash']

const PROMPT = `You are analysing aerial imagery of a building rooftop. The 4 tiles form a 2x2 grid (top-left, top-right, bottom-left, bottom-right) and the target building sits near the CENTRE of the combined area.

TASK: Determine whether photovoltaic (PV) solar panels are ALREADY installed on the roof of the building nearest the centre.

GUIDANCE:
- Solar panels: rectangular grid of dark blue/black cells, often with a visible metallic frame.
- Do NOT confuse with: skylights, water-heater tanks, dark roofing membrane, AC units, shadows, or blue-painted metal roofs (very common in Thailand).
- If the imagery is blurry, cloudy, or the roof is not visible, return has_existing_solar: false with confidence <= 0.25.
- panel_coverage_pct: approximate percent of visible roof covered by panels (0 if none).

Return ONLY valid JSON, no markdown fences:
{"has_existing_solar":true|false,"confidence":0.0-1.0,"panel_coverage_pct":0-100}`

const tileUrl = (z, y, x) =>
  `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`

async function fetchTile(z, y, x) {
  const res = await fetch(tileUrl(z, y, x), { signal: AbortSignal.timeout(15000) })
  if (!res.ok) throw new Error(`esri_${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length < MIN_TILE_BYTES) throw new Error(`placeholder_tile_${buf.length}b`)
  return buf.toString('base64')
}

/** 2x2 tile block whose shared corner is nearest the point. */
async function fetchAerial(lat, lon) {
  const n = 2 ** TILE_ZOOM
  const xf = ((lon + 180) / 360) * n
  const yf = ((1 - Math.asinh(Math.tan((lat * Math.PI) / 180)) / Math.PI) / 2) * n
  const x0 = Math.max(0, Math.min(n - 2, Math.round(xf) - 1))
  const y0 = Math.max(0, Math.min(n - 2, Math.round(yf) - 1))
  return Promise.all([
    fetchTile(TILE_ZOOM, y0, x0), fetchTile(TILE_ZOOM, y0, x0 + 1),
    fetchTile(TILE_ZOOM, y0 + 1, x0), fetchTile(TILE_ZOOM, y0 + 1, x0 + 1),
  ])
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** Models ignore responseMimeType often enough that we must dig the JSON out. */
function parseVerdict(text) {
  const m = text.match(/\{[^{}]*"has_existing_solar"[\s\S]*?\}/)
  if (!m) throw new Error('no_json_in_reply')
  return JSON.parse(m[0])
}

async function callGemini(images) {
  let lastErr = ''
  // Retry each model with backoff before rolling to the next: free-tier quota is
  // per-model and bursty, so a 429 usually clears in a few seconds. Rolling
  // immediately just burns the next model's quota at the same rate.
  for (const model of MODELS) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(45000),
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: PROMPT },
                  ...images.map((data) => ({ inline_data: { mime_type: 'image/jpeg', data } })),
                ],
              }],
              generationConfig: { temperature: 0, maxOutputTokens: 200, responseMimeType: 'application/json' },
            }),
          },
        )
        if (res.status === 429 || res.status === 503) {
          lastErr = `${res.status}_${model}`
          await sleep(2000 * 2 ** attempt + Math.random() * 1000)
          continue
        }
        if (!res.ok) { lastErr = `${res.status}_${model}`; break }
        const json = await res.json()
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
        const parsed = parseVerdict(text)
        return {
          solar: parsed.has_existing_solar === true || parsed.has_existing_solar === 'true',
          confidence: Number(parsed.confidence) || 0,
          coverage: Number(parsed.panel_coverage_pct) || 0,
          model,
        }
      } catch (e) {
        lastErr = String(e.message || e)
        if (lastErr.includes('no_json_in_reply')) break   // retrying won't help
        await sleep(1500 * (attempt + 1))
      }
    }
  }
  throw new Error(lastErr || 'all_models_failed')
}

// ── load inputs ───────────────────────────────────────────────────────────
const raw = readFileSync(IN_FILE, 'utf8')
const buildings = JSON.parse(raw.slice(raw.indexOf('['), raw.lastIndexOf(']') + 1))

const out = existsSync(OUT_FILE) ? JSON.parse(readFileSync(OUT_FILE, 'utf8')) : {}
const todo = buildings.filter((b) => !(String(b.i) in out)).slice(0, LIMIT)

console.log(`${buildings.length} buildings · ${Object.keys(out).length} already checked · ${todo.length} to do`)

let done = 0, solarFound = 0, failed = 0
const started = Date.now()

function save() {
  writeFileSync(OUT_FILE, JSON.stringify(out))
}

async function worker(queue) {
  while (queue.length) {
    const b = queue.pop()
    try {
      const images = await fetchAerial(b.la, b.lo)
      const r = await callGemini(images)
      out[String(b.i)] = { s: r.solar, c: r.confidence, p: r.coverage }
      if (r.solar && r.confidence >= 0.5) solarFound++
    } catch (e) {
      out[String(b.i)] = { s: false, c: 0, p: 0, err: String(e.message || e).slice(0, 40) }
      failed++
    }
    done++
    if (done % SAVE_EVERY === 0) {
      const rate = done / ((Date.now() - started) / 1000)
      const eta = Math.round((todo.length - done) / rate / 60)
      save()
      console.log(`${done}/${todo.length} · solar: ${solarFound} · failed: ${failed} · ${rate.toFixed(1)}/s · ETA ${eta}m`)
    }
  }
}

const queue = [...todo]
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(queue)))
save()

const confident = Object.values(out).filter((r) => r.s && r.c >= 0.5).length
console.log(`\nDONE. ${Object.keys(out).length} buildings checked.`)
console.log(`${confident} have existing solar (confidence >= 0.5) · ${failed} failed this run`)
console.log(`→ ${OUT_FILE}`)
