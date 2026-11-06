#!/usr/bin/env node
// Launch scout: collects the latest startup and tech launches and writes them
// to one JSON file that the Live page reads.
//
//   node agent/launch-scout.mjs [--out public/data/launches.json]
//
// Sources
//   x    X API v2 recent search. Runs only when X_BEARER_TOKEN is set.
//        X bills per post read, so each run asks only for posts newer than the
//        last one it saw, keeps each day under X_DAILY_READS (the monthly
//        budget spread evenly over the month) and stops at X_MONTHLY_READS.
//   hn   Hacker News "Show HN" and "Launch HN" posts, from the free Algolia API.
//
// No dependencies. Needs Node 20 or newer (global fetch).

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

const arg = (name, fallback) => {
  const k = process.argv.indexOf(`--${name}`)
  return k > -1 ? process.argv[k + 1] : fallback
}
const env = (name, fallback) => process.env[name] || fallback

const OUT = arg('out', 'public/data/launches.json')
const KEEP_DAYS = Number(env('KEEP_DAYS', 7))
const MAX_ITEMS = Number(env('MAX_ITEMS', 300))
const X_TOKEN = env('X_BEARER_TOKEN', '')
const X_MAX_PER_RUN = Math.min(100, Math.max(10, Number(env('X_MAX_PER_RUN', 50))))
const X_MONTHLY_READS = Number(env('X_MONTHLY_READS', 15000))
// Default: the monthly budget spread evenly, so credit lasts the whole month.
const X_DAILY_READS = Number(env('X_DAILY_READS', Math.floor(X_MONTHLY_READS / 30)))
const X_MIN_FOLLOWERS = Number(env('X_MIN_FOLLOWERS', 2000))
const HN_MIN_POINTS = Number(env('HN_MIN_POINTS', 3))

// Phrases people use when they ship something.
const LAUNCH = /\b(launch(ing|ed)?|we('| a)re live|now live|is live|just shipped|shipping today|introducing|meet [A-Z]|announcing|out now|today we|public beta|open[- ]sourc(e|ing)|v\d+(\.\d+)? is (out|here)|available (today|now)|launch hn|show hn)\b/i
// Signals that the thing is a tech product, not a sale or a concert.
const TECH = /\b(ai|agent|agents|llm|model|api|sdk|app|startup|platform|developer|devs?|open[- ]source|github|saas|infra|database|robot|chip|gpu|beta|product|tool|mcp|copilot|voice|search|browser|cli)\b/i
const NOISE = /\b(giveaway|airdrop|presale|token sale|memecoin|nft|pump|casino|betting|onlyfans)\b/i

const TAGS = [
  ['AI', /\b(ai|llm|model|gpt|claude|gemini|inference|multimodal|diffusion|ml)\b/i],
  ['Agents', /\b(agent|agents|agentic|autonomous|mcp)\b/i],
  ['Dev tools', /\b(api|sdk|cli|developer|devs?|ide|code|coding|github|debug|testing|deploy)\b/i],
  ['Open source', /\b(open[- ]sourc\w*|github\.com|mit licen[sc]e|apache 2)\b/i],
  ['Infra', /\b(database|infra|gpu|cloud|serverless|kubernetes|postgres|vector|latency|compute)\b/i],
  ['Voice', /\b(voice|speech|audio|tts|transcri\w+)\b/i],
  ['Robotics', /\b(robot\w*|drone|humanoid|hardware|chip)\b/i],
  ['Fintech', /\b(fintech|payments?|banking|stripe|invoice|accounting)\b/i],
  ['Health', /\b(health|medical|clinical|patient|bio\w*)\b/i],
]
const tagsFor = (s) => TAGS.filter(([, re]) => re.test(s)).map(([t]) => t).slice(0, 3)

const clean = (s) =>
  s
    .replace(/https:\/\/t\.co\/\w+/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
const firstLine = (s, n = 110) => {
  const line = clean(s).split('\n').find((l) => l.trim()) ?? ''
  return line.length > n ? `${line.slice(0, n - 1).trimEnd()}…` : line
}

async function getJson(url, init) {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(20000) })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} from ${new URL(url).host}: ${(await res.text()).slice(0, 200)}`)
  return res.json()
}

/* ------------------------------------------------------------------ */

async function fromX(meta) {
  if (!X_TOKEN) return { status: 'off', note: 'Set X_BEARER_TOKEN to turn on.', items: [] }
  const month = new Date().toISOString().slice(0, 7)
  const today = new Date().toISOString().slice(0, 10)
  const usage = meta.x?.month === month ? meta.x.reads : 0
  const usedToday = meta.x?.day === today ? meta.x.dayReads : 0
  const left = Math.min(X_MONTHLY_READS - usage, X_DAILY_READS - usedToday, X_MAX_PER_RUN)
  const keep = { items: [], month, day: today, reads: usage, dayReads: usedToday, sinceId: meta.x?.sinceId }
  // X's minimum page is 10 posts, so stop once fewer than 10 reads are left.
  if (usage + 10 > X_MONTHLY_READS) return { ...keep, status: 'paused', note: `Monthly read budget reached (${usage}/${X_MONTHLY_READS}).` }
  if (left < 10) return { ...keep, status: 'paused', note: `Daily read budget reached (${usedToday}/${X_DAILY_READS}). Resumes tomorrow.` }
  const query = [
    '(launching OR launched OR "we\'re live" OR "now live" OR introducing OR "just shipped" OR "out now" OR "public beta" OR "launch day")',
    '(AI OR agent OR API OR startup OR app OR "open source" OR developers OR LLM)',
    '-is:retweet -is:reply lang:en',
  ].join(' ')
  const u = new URL('https://api.x.com/2/tweets/search/recent')
  u.searchParams.set('query', query)
  u.searchParams.set('max_results', String(left))
  u.searchParams.set('tweet.fields', 'created_at,public_metrics,attachments')
  u.searchParams.set('expansions', 'author_id,attachments.media_keys')
  u.searchParams.set('user.fields', 'name,username,profile_image_url,public_metrics,verified')
  u.searchParams.set('media.fields', 'preview_image_url,url,type')
  if (meta.x?.sinceId) u.searchParams.set('since_id', meta.x.sinceId)
  else u.searchParams.set('start_time', new Date(Date.now() - 6 * 3600e3).toISOString())

  const j = await getJson(u, { headers: { Authorization: `Bearer ${X_TOKEN}` } })
  const users = new Map((j.includes?.users ?? []).map((x) => [x.id, x]))
  const media = new Map((j.includes?.media ?? []).map((m) => [m.media_key, m]))
  const posts = j.data ?? []
  const items = []
  for (const t of posts) {
    const a = users.get(t.author_id)
    if (!a || (a.public_metrics?.followers_count ?? 0) < X_MIN_FOLLOWERS) continue
    if (!LAUNCH.test(t.text) || !TECH.test(t.text) || NOISE.test(t.text)) continue
    const m = (t.attachments?.media_keys ?? []).map((k) => media.get(k)).find(Boolean)
    const pm = t.public_metrics ?? {}
    items.push({
      id: `x:${t.id}`,
      source: 'x',
      url: `https://x.com/${a.username}/status/${t.id}`,
      title: firstLine(t.text),
      text: clean(t.text).slice(0, 400),
      name: a.name,
      handle: a.username,
      avatar: a.profile_image_url?.replace('_normal', '_bigger') ?? '',
      image: m?.url || m?.preview_image_url || '',
      followers: a.public_metrics?.followers_count ?? 0,
      created: t.created_at,
      metrics: { likes: pm.like_count ?? 0, reposts: pm.retweet_count ?? 0, replies: pm.reply_count ?? 0, views: pm.impression_count ?? 0 },
      tags: tagsFor(t.text),
    })
  }
  return {
    status: 'ok',
    items,
    month,
    day: today,
    reads: usage + posts.length,
    dayReads: usedToday + posts.length,
    sinceId: j.meta?.newest_id ?? meta.x?.sinceId,
    note: `${posts.length} posts read, ${items.length} kept.`,
  }
}

async function fromHN() {
  const since = Math.floor(Date.now() / 1000) - 48 * 3600
  const filters = `created_at_i>${since},points>=${HN_MIN_POINTS}`
  const urls = [
    `https://hn.algolia.com/api/v1/search_by_date?tags=show_hn&numericFilters=${filters}&hitsPerPage=100`,
    `https://hn.algolia.com/api/v1/search_by_date?query=%22Launch%20HN%22&tags=story&numericFilters=${filters}&hitsPerPage=40`,
  ]
  const seen = new Set()
  const items = []
  for (const url of urls) {
    const j = await getJson(url)
    for (const h of j.hits ?? []) {
      if (seen.has(h.objectID) || !h.title) continue
      seen.add(h.objectID)
      const title = h.title.replace(/^(Show|Launch) HN:\s*/i, '')
      const kind = /^Launch HN/i.test(h.title) ? 'Launch HN' : 'Show HN'
      items.push({
        id: `hn:${h.objectID}`,
        source: 'hn',
        kind,
        url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
        discussion: `https://news.ycombinator.com/item?id=${h.objectID}`,
        title,
        text: '',
        name: h.author,
        handle: h.author,
        site: h.url ? new URL(h.url).hostname.replace(/^www\./, '') : 'news.ycombinator.com',
        created: h.created_at,
        metrics: { points: h.points ?? 0, comments: h.num_comments ?? 0 },
        tags: tagsFor(title),
      })
    }
  }
  return { status: 'ok', items, note: `${items.length} posts.` }
}

/* ------------------------------------------------------------------ */

/** Reads a page's og:image (or twitter:image) so the Live page can show a thumbnail. */
async function previewFor(url) {
  const res = await fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(8000),
    headers: { 'user-agent': 'launch-scout/1.0 (+https://mindunter.github.io/new-media/live)', accept: 'text/html' },
  })
  if (!res.ok || !(res.headers.get('content-type') ?? '').includes('html')) return ''
  const html = (await res.text()).slice(0, 300_000)
  const m =
    html.match(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)(?::src)?["'][^>]*content=["']([^"']+)["']/i) ??
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["'](?:og:image|twitter:image)["']/i)
  if (!m) return ''
  const src = new URL(m[1].replace(/&amp;/g, '&'), res.url).href
  return src.startsWith('https://') ? src : ''
}

/** Finds preview images for launches that do not have one yet. Each page is tried once. */
async function addPreviews(items) {
  const todo = items.filter((it) => !it.image && !it.imageTried && it.source === 'hn' && /^https:/.test(it.url))
  let k = 0
  const worker = async () => {
    while (k < todo.length) {
      const it = todo[k++]
      it.imageTried = true
      try {
        it.image = await previewFor(it.url)
      } catch {
        it.image = ''
      }
    }
  }
  await Promise.all(Array.from({ length: 8 }, worker))
  if (todo.length) console.log(`  previews: ${todo.filter((it) => it.image).length}/${todo.length} found`)
}

/** One number to rank by: engagement, decayed by age so new launches can rise. */
function score(it) {
  const m = it.metrics
  const raw = it.source === 'x' ? m.likes + 2 * m.reposts + m.replies + m.views / 200 : 8 * m.points + 4 * m.comments
  const hours = Math.max(0, (Date.now() - Date.parse(it.created)) / 3600e3)
  return Math.round((raw / Math.pow(hours + 2, 1.2)) * 100) / 100
}

async function main() {
  const prev = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : { items: [], meta: {} }
  const meta = prev.meta ?? {}
  const runs = { x: fromX(meta), hn: fromHN() }
  const sources = {}
  const fresh = []
  for (const [name, p] of Object.entries(runs)) {
    try {
      const r = await p
      sources[name] = { status: r.status, note: r.note, at: new Date().toISOString() }
      fresh.push(...r.items)
      if (name === 'x' && r.month) meta.x = { month: r.month, reads: r.reads, day: r.day, dayReads: r.dayReads, sinceId: r.sinceId }
    } catch (e) {
      // Keep the last good items from a source that failed this time.
      sources[name] = { status: 'error', note: String(e.message ?? e).slice(0, 200), at: new Date().toISOString() }
      console.error(`[${name}]`, e.message ?? e)
    }
  }

  // Newer data replaces older copies of the same post; old posts age out.
  const byId = new Map(prev.items.map((it) => [it.id, it]))
  for (const it of fresh) {
    const old = byId.get(it.id)
    byId.set(it.id, { ...it, image: it.image || old?.image || '', imageTried: old?.imageTried })
  }
  const cutoff = Date.now() - KEEP_DAYS * 86400e3
  const items = [...byId.values()]
    .filter((it) => Date.parse(it.created) > cutoff)
    .map((it) => ({ ...it, score: score(it) }))
    .sort((a, b) => Date.parse(b.created) - Date.parse(a.created))
    .slice(0, MAX_ITEMS)

  await addPreviews(items)

  const out = { updated: new Date().toISOString(), sources, count: items.length, items, meta }
  mkdirSync(dirname(OUT), { recursive: true })
  writeFileSync(OUT, `${JSON.stringify(out, null, 1)}\n`)
  console.log(`launch scout: ${items.length} launches (${fresh.length} fresh) -> ${OUT}`)
  for (const [k, v] of Object.entries(sources)) console.log(`  ${k}: ${v.status}. ${v.note ?? ''}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
