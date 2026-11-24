// scripts/share-to-buffer.mjs
//
// Shares posts and events to social media through Buffer.
//
// Editors tick "Share on social media" on a post or event in the CMS (and
// optionally pick a "Social media post date"). After each deploy the GitHub
// workflow (.github/workflows/deploy.yml, job "share") runs this script, which:
//
//   1. waits until the freshly deployed site serves /social-queue.json
//      (the list of flagged items, built by src/pages/social-queue.json.ts),
//   2. finds the Buffer channels (all unlocked ones, or the ones listed in
//      BUFFER_CHANNEL_IDS),
//   3. skips anything Buffer already has (scheduled or sent) for a channel,
//   4. creates the rest in Buffer:
//        - with a post date: scheduled for 10:00 Finnish time on that day
//          (the date must be tomorrow or later),
//        - without one: added to the channel's Buffer queue (next free slot).
//
// It uses no dependencies -- just Node 22's built-in fetch.
//
// Environment:
//   BUFFER_API_KEY          required (GitHub secret). Without it the script
//                           does nothing and exits successfully.
//   BUFFER_ORGANIZATION_ID  only needed if the Buffer account has several
//                           organizations.
//   BUFFER_CHANNEL_IDS      optional, comma-separated. Default: all unlocked
//                           channels of the organization.
//   SITE_URL                default https://www.dariah.fi
//   DRY_RUN=true            print what would be posted, create nothing.
//   BUFFER_API_URL          default https://api.buffer.com (override for tests)
//
// Buffer API docs: https://developers.buffer.com

const API_URL = process.env.BUFFER_API_URL ?? 'https://api.buffer.com'
const KEY = process.env.BUFFER_API_KEY
const SITE = (process.env.SITE_URL ?? 'https://www.dariah.fi').replace(/\/$/, '')
const DRY_RUN = process.env.DRY_RUN === 'true'
const ORG_ID = process.env.BUFFER_ORGANIZATION_ID
const ONLY_CHANNELS = (process.env.BUFFER_CHANNEL_IDS ?? '').split(',').map((s) => s.trim()).filter(Boolean)
const POST_HOUR = 10 // 10:00 ...
const TIME_ZONE = 'Europe/Helsinki' // ... Finnish time
const MAX_AGE_DAYS_WITHOUT_DATE = 14 // posts without a post date are only shared while this fresh

// Networks we can post to with plain text + link. (Instagram, Pinterest,
// TikTok and YouTube need an image/video or extra settings, so they are left out.)
const TEXT_LIMITS = {
  twitter: 280, x: 280, bluesky: 300, mastodon: 500, threads: 500,
  linkedin: 3000, facebook: 5000, googlebusiness: 1500,
}

const log = (msg) => console.log(msg)
const warn = (msg) => console.log(`::warning::${msg}`)
const fail = (msg) => { console.log(`::error::${msg}`); process.exitCode = 1 }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

if (!KEY) {
  log('[buffer] BUFFER_API_KEY is not set -- nothing to do.')
  process.exit(0)
}

// ---------- time helpers ----------

function todayInFinland() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(new Date()) // YYYY-MM-DD
}

function tzOffsetMs(ts) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: TIME_ZONE, hourCycle: 'h23', year: 'numeric', month: '2-digit',
      day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
    }).formatToParts(ts).map((p) => [p.type, p.value]),
  )
  return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second) - ts
}

// 10:00 Finnish time on YYYY-MM-DD, as a UTC Date (handles summer/winter time).
export function dueAtFor(dateStr, hour = POST_HOUR) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const wall = Date.UTC(y, m - 1, d, hour)
  let utc = wall - tzOffsetMs(wall)
  utc = wall - tzOffsetMs(utc)
  return new Date(utc)
}

// ---------- Buffer API ----------

async function gql(query) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${KEY}`,
      'User-Agent': 'dariah-fi-website/1.0',
    },
    body: JSON.stringify({ query }),
  })
  const text = await res.text()
  let json
  try { json = JSON.parse(text) } catch { throw new Error(`Buffer returned HTTP ${res.status}: ${text.slice(0, 200)}`) }
  if (json.errors?.length) throw new Error(`Buffer API error: ${json.errors.map((e) => e.message).join('; ')}`)
  if (!res.ok) throw new Error(`Buffer returned HTTP ${res.status}`)
  return json.data
}

const q = (value) => JSON.stringify(value) // JSON strings are valid GraphQL string literals

async function getOrganizationId() {
  if (ORG_ID) return ORG_ID
  const data = await gql('query { account { organizations { id name } } }')
  const orgs = data.account.organizations
  if (orgs.length === 1) return orgs[0].id
  throw new Error(
    `The Buffer account has ${orgs.length} organizations (${orgs.map((o) => `${o.name}: ${o.id}`).join(', ')}). ` +
    'Set BUFFER_ORGANIZATION_ID to pick one.',
  )
}

async function getChannels(orgId) {
  const data = await gql(
    `query { channels(input: { organizationId: ${q(orgId)}, filter: { isLocked: false } }) { id name displayName service } }`,
  )
  let channels = data.channels
  if (ONLY_CHANNELS.length) channels = channels.filter((c) => ONLY_CHANNELS.includes(c.id))
  const usable = channels.filter((c) => TEXT_LIMITS[String(c.service).toLowerCase()])
  for (const c of channels) {
    if (!usable.includes(c)) log(`[buffer] Skipping ${c.displayName ?? c.name} (${c.service}): not supported yet (needs images/extra settings).`)
  }
  return usable
}

// Posts Buffer already has (scheduled or sent) -> a set of "channelId|text" lookups.
async function getExistingPosts(orgId, channelIds) {
  const posts = []
  let after = null
  for (let page = 0; page < 50; page++) {
    const data = await gql(`query {
      posts(first: 50${after ? `, after: ${q(after)}` : ''}, input: {
        organizationId: ${q(orgId)},
        filter: { status: [scheduled, sent], channelIds: ${q(channelIds)} }
      }) {
        edges { node { id text channelId } }
        pageInfo { hasNextPage endCursor }
      }
    }`)
    posts.push(...data.posts.edges.map((e) => e.node))
    if (!data.posts.pageInfo.hasNextPage) break
    after = data.posts.pageInfo.endCursor
  }
  return posts
}

async function createPost({ channelId, text, dueAt }) {
  const mode = dueAt ? `mode: customScheduled, dueAt: ${q(dueAt.toISOString())}` : 'mode: addToQueue'
  const data = await gql(`mutation {
    createPost(input: { text: ${q(text)}, channelId: ${q(channelId)}, schedulingType: automatic, ${mode} }) {
      ... on PostActionSuccess { post { id dueAt } }
      ... on MutationError { message }
    }
  }`)
  const result = data.createPost
  if (result.message) throw new Error(result.message)
  return result.post
}

// ---------- the site's queue ----------

async function fetchQueue() {
  const expected = process.env.GITHUB_SHA
  let lastProblem = ''
  for (let attempt = 1; attempt <= 20; attempt++) {
    try {
      const res = await fetch(`${SITE}/social-queue.json`, { headers: { 'Cache-Control': 'no-cache' } })
      if (res.ok) {
        const json = await res.json()
        if (!expected || !json.commit || json.commit === expected) return json
        lastProblem = 'the site still serves an older version'
      } else {
        lastProblem = `HTTP ${res.status}`
      }
    } catch (err) {
      lastProblem = err.message
    }
    log(`[buffer] Waiting for the deployed site (${lastProblem}), attempt ${attempt}/20...`)
    await sleep(30_000)
  }
  throw new Error(`Could not read ${SITE}/social-queue.json (${lastProblem}).`)
}

// ---------- text ----------

function hashtags(tags) {
  return (tags ?? []).slice(0, 3)
    .map((t) => '#' + t.split(/[^A-Za-z0-9]+/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(''))
    .join(' ')
}

const clip = (s, max) => (s.length <= max ? s : s.slice(0, Math.max(0, max - 1)).replace(/\s+\S*$/, '') + '…')

export function buildText(item, service) {
  const limit = TEXT_LIMITS[String(service).toLowerCase()] ?? 280
  const where = [item.location, item.isOnline ? 'Online' : ''].filter(Boolean).join(' · ')
  const head = item.type === 'event'
    ? [item.title, [item.dateLine, where].filter(Boolean).join(' · ')].filter(Boolean).join('\n')
    : item.title
  const join = (parts) => parts.filter(Boolean).join('\n\n')
  const tags = hashtags(item.tags)
  const summary = item.summary ?? ''

  let text = join([head, summary, item.url, tags])
  if (text.length > limit) text = join([head, summary, item.url])
  if (text.length > limit) {
    const room = limit - join([head, 'x', item.url]).length + 1 // space left for the summary
    text = join([head, room > 40 ? clip(summary, room) : '', item.url])
  }
  if (text.length > limit) text = join([clip(head, limit - item.url.length - 2), item.url])
  return text
}

// ---------- main ----------

async function main() {
  log(`[buffer] ${DRY_RUN ? 'DRY RUN -- ' : ''}reading ${SITE}/social-queue.json`)
  const queue = await fetchQueue()
  if (!queue.items.length) return log('[buffer] No items are flagged for sharing.')

  const orgId = await getOrganizationId()
  const channels = await getChannels(orgId)
  if (!channels.length) return fail('No usable Buffer channels found (check BUFFER_CHANNEL_IDS and that channels are connected).')
  log(`[buffer] Channels: ${channels.map((c) => `${c.displayName ?? c.name} (${c.service})`).join(', ')}`)

  const existing = await getExistingPosts(orgId, channels.map((c) => c.id))
  const alreadyShared = (item, channel) => {
    const path = new URL(item.url).pathname.replace(/\/$/, '')
    return existing.some((p) => p.channelId === channel.id && p.text.includes(path))
  }

  const today = todayInFinland()
  let created = 0

  for (const item of queue.items) {
    const todo = channels.filter((c) => !alreadyShared(item, c))
    if (!todo.length) continue // already in Buffer everywhere

    // Decide when it goes out, and whether it still should.
    let dueAt = null
    if (item.postDate) {
      if (item.postDate <= today) {
        warn(`"${item.title}": the social media post date ${item.postDate} is not in the future (today is ${today}, Finnish time). Pick tomorrow or later. Not shared.`)
        continue
      }
      if (item.type === 'event' && item.postDate > item.endDate) {
        warn(`"${item.title}": the social media post date ${item.postDate} is after the event (${item.endDate}). Not shared.`)
        continue
      }
      dueAt = dueAtFor(item.postDate)
    } else if (item.type === 'event' && item.endDate < today) {
      log(`[buffer] "${item.title}" is a past event -- not shared.`)
      continue
    } else if (item.type === 'post') {
      const ageDays = (Date.parse(today) - Date.parse(item.publishedAt)) / 86_400_000
      if (ageDays > MAX_AGE_DAYS_WITHOUT_DATE) {
        warn(`"${item.title}" was published ${Math.round(ageDays)} days ago and has no social media post date, so it was not shared. Pick a post date (tomorrow or later) if you still want to share it.`)
        continue
      }
    }

    for (const channel of todo) {
      const text = buildText(item, channel.service)
      const when = dueAt ? `scheduled ${dueAt.toISOString()}` : 'added to queue'
      const label = `"${item.title}" -> ${channel.displayName ?? channel.name} (${channel.service}), ${when}`
      if (DRY_RUN) {
        log(`[buffer] WOULD POST ${label}\n${text.split('\n').map((l) => '    | ' + l).join('\n')}`)
        continue
      }
      try {
        await createPost({ channelId: channel.id, text, dueAt })
        created++
        log(`[buffer] Posted ${label}`)
      } catch (err) {
        fail(`Could not share ${label}: ${err.message}`)
      }
      await sleep(500) // be gentle with the API rate limits
    }
  }
  log(`[buffer] Done. ${DRY_RUN ? 'Dry run, nothing created.' : `${created} post(s) created.`}`)
}

main().catch((err) => fail(err.message))