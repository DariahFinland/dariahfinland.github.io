// scripts/fetch-goatcounter.mjs
//
// Runs before every build (see the "build" script in package.json) and
// writes the last 30 days of GoatCounter statistics to src/data/stats.json,
// which the /statistics page renders. Since the site is rebuilt daily by
// the cron in .github/workflows/deploy.yml, the page stays up to date
// automatically.
//
// Needs a GoatCounter API token with the "Read statistics" permission,
// available as the GOATCOUNTER_API_TOKEN environment variable (a GitHub
// Actions repository secret in production -- it never reaches the browser).
// Without a token, or if GoatCounter can't be reached, this script leaves
// the existing src/data/stats.json untouched and exits successfully, so a
// stats problem can never break a deploy.
//
// API reference: https://www.goatcounter.com/api

import { readFile, writeFile } from 'node:fs/promises'

const TOKEN = process.env.GOATCOUNTER_API_TOKEN
const BASE = (process.env.GOATCOUNTER_URL ?? 'https://dariahfinland.goatcounter.com').replace(/\/$/, '')
const OUT = new URL('../src/data/stats.json', import.meta.url)
const DAYS = 30
const TOP = 10

if (!TOKEN) {
  console.log('[stats] GOATCOUNTER_API_TOKEN not set -- keeping existing src/data/stats.json')
  process.exit(0)
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const dayKey = (d) => d.toISOString().slice(0, 10)

// Period: today (UTC) and the 29 days before it => 30 daily bars.
const now = new Date()
const endDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
const startDay = new Date(endDay.getTime() - (DAYS - 1) * 86400000)
const range = {
  start: startDay.toISOString(),
  end: new Date(endDay.getTime() + 86400000 - 1000).toISOString(),
}

async function api(path, params = {}, attempt = 0) {
  const url = new URL(`${BASE}/api/v0${path}`)
  for (const [k, v] of Object.entries({ ...range, ...params })) url.searchParams.set(k, String(v))
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json' },
  })
  if (res.status === 429 && attempt < 3) {
    // GoatCounter rate-limits the API (a few requests per second) -- back off and retry.
    const wait = Number(res.headers.get('Retry-After') ?? 1) * 1000
    await sleep(wait + 250)
    return api(path, params, attempt + 1)
  }
  if (!res.ok) {
    const body = (await res.text()).replace(/\s+/g, ' ').slice(0, 200)
    throw new Error(`GET ${url.origin}${url.pathname}?${url.searchParams} -> HTTP ${res.status} ${body}`)
  }
  return res.json()
}

// GoatCounter's breakdown endpoints all return { stats: [{ id, name, count }] }.
const breakdown = (res) =>
  (res.stats ?? [])
    .map((s) => ({ name: String(s.name || s.id || 'Unknown'), count: Number(s.count) || 0 }))
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, TOP)

async function optional(label, fn, fallback = []) {
  try {
    await sleep(300)
    return await fn()
  } catch (err) {
    console.warn(`[stats] ${label} failed (${err.message}) -- leaving that section empty`)
    return fallback
  }
}

try {
  // --- per-path stats: source for "top pages", and (fallback) the daily series ---
  // group=day makes each hit's `stats` an array of per-day counts.
  const hitsRes = await optional('hits', () => api('/stats/hits', { limit: 100, group: 'day' }), null)
  const hits = (hitsRes?.hits ?? []).filter((h) => !h.event)

  // --- daily pageviews ---
  // Preferred: /stats/total. If that's unavailable, sum the per-path daily
  // counts from /stats/hits instead (covers up to the 100 busiest pages).
  const byDay = new Map()
  const addDay = (s) => {
    const count = s.daily ?? (Array.isArray(s.hourly) ? s.hourly.reduce((a, b) => a + b, 0) : 0)
    const key = String(s.day).slice(0, 10)
    byDay.set(key, (byDay.get(key) ?? 0) + (Number(count) || 0))
  }
  let source = 'total'
  try {
    const total = await api('/stats/total')
    for (const s of total.stats ?? []) addDay(s)
  } catch (err) {
    console.warn(`[stats] /stats/total failed (${err.message}) -- falling back to /stats/hits`)
    source = 'hits'
    byDay.clear()
    for (const h of hits) for (const s of h.stats ?? []) addDay(s)
    if (!hits.length) throw new Error('neither /stats/total nor /stats/hits returned data')
  }
  const daily = []
  for (let i = 0; i < DAYS; i++) {
    const day = dayKey(new Date(startDay.getTime() + i * 86400000))
    daily.push({ day, count: byDay.get(day) ?? 0 })
  }

  const pages = hits
    .map((h) => ({ path: h.path, title: h.title || '', count: Number(h.count) || 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, TOP)
  const referrers = await optional('referrers', async () => breakdown(await api('/stats/toprefs', { limit: 25 })))
  const countries = await optional('countries', async () => breakdown(await api('/stats/locations', { limit: 25 })))
  const browsers = await optional('browsers', async () => breakdown(await api('/stats/browsers', { limit: 25 })))
  const systems = await optional('systems', async () => breakdown(await api('/stats/systems', { limit: 25 })))
  const sizes = await optional('screen sizes', async () => breakdown(await api('/stats/sizes', { limit: 25 })))

  const stats = {
    generatedAt: new Date().toISOString(),
    period: { start: dayKey(startDay), end: dayKey(endDay) },
    totalPageviews: daily.reduce((a, d) => a + d.count, 0),
    daily,
    pages,
    referrers,
    countries,
    browsers,
    systems,
    sizes,
  }
  await writeFile(OUT, JSON.stringify(stats, null, 2) + '\n')
  console.log(`[stats] wrote ${dayKey(startDay)}..${dayKey(endDay)}: ${stats.totalPageviews} pageviews (daily series from /stats/${source})`)
} catch (err) {
  console.warn(`[stats] could not fetch statistics (${err.message}) -- keeping existing src/data/stats.json`)
  try {
    await readFile(OUT)
  } catch {
    console.warn('[stats] ...and no existing stats.json found; the /statistics page will show a placeholder')
  }
}
