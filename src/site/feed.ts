import { useEffect, useState } from 'react'

/**
 * The live launch feed.
 *
 * agent/launch-scout.mjs writes data/launches.json on a schedule (X and Hacker News).
 * The page reads that file, then also asks Hacker News directly every minute,
 * so new Show HN and Launch HN posts appear without waiting for the next run.
 */

export type LiveItem = {
  id: string
  source: 'x' | 'hn'
  kind?: string
  url: string
  discussion?: string
  title: string
  text?: string
  name: string
  handle: string
  avatar?: string
  image?: string
  site?: string
  created: string
  metrics: { likes?: number; reposts?: number; replies?: number; views?: number; points?: number; comments?: number }
  tags: string[]
  score?: number
  /** Set on items that arrived after the page opened. */
  fresh?: boolean
}

type Source = { status: string; note?: string; at: string }
type FeedFile = { updated: string; sources: Record<string, Source>; items: LiveItem[] }

const FILE_EVERY = 120_000
const HN_EVERY = 60_000

const TAGS: [string, RegExp][] = [
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
const tagsFor = (s: string) => TAGS.filter(([, re]) => re.test(s)).map(([t]) => t).slice(0, 3)

type Hit = { objectID: string; title?: string; url?: string; author: string; created_at: string; points?: number; num_comments?: number }

async function liveHN(): Promise<LiveItem[]> {
  const since = Math.floor(Date.now() / 1000) - 48 * 3600
  const res = await fetch(`https://hn.algolia.com/api/v1/search_by_date?tags=show_hn&numericFilters=created_at_i>${since},points>=2&hitsPerPage=60`)
  if (!res.ok) throw new Error(String(res.status))
  const j = (await res.json()) as { hits: Hit[] }
  return j.hits
    .filter((h) => h.title)
    .map((h) => {
      const title = h.title!.replace(/^(Show|Launch) HN:\s*/i, '')
      let site = 'news.ycombinator.com'
      try {
        if (h.url) site = new URL(h.url).hostname.replace(/^www\./, '')
      } catch {
        /* keep the default */
      }
      return {
        id: `hn:${h.objectID}`,
        source: 'hn' as const,
        kind: 'Show HN',
        url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
        discussion: `https://news.ycombinator.com/item?id=${h.objectID}`,
        title,
        name: h.author,
        handle: h.author,
        site,
        created: h.created_at,
        metrics: { points: h.points ?? 0, comments: h.num_comments ?? 0 },
        tags: tagsFor(title),
      }
    })
}

/** Ranks by engagement, decayed by age, so a new launch can rise above an older big one. */
export function trend(it: LiveItem) {
  const m = it.metrics
  const raw = it.source === 'x' ? (m.likes ?? 0) + 2 * (m.reposts ?? 0) + (m.replies ?? 0) + (m.views ?? 0) / 200 : 8 * (m.points ?? 0) + 4 * (m.comments ?? 0)
  const hours = Math.max(0, (Date.now() - Date.parse(it.created)) / 3600e3)
  return raw / Math.pow(hours + 2, 1.2)
}

export function useLaunchFeed() {
  const [items, setItems] = useState<LiveItem[]>([])
  const [updated, setUpdated] = useState<Date | null>(null)
  const [sources, setSources] = useState<Record<string, Source>>({})
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading')

  useEffect(() => {
    let alive = true
    // Items from the first file and first live call are the starting list; later arrivals are new.
    let ready = false
    const merge = (incoming: LiveItem[]) => {
      if (!alive || !incoming.length) return
      // Read now: the updater below runs later, during render.
      const isNew = ready
      setItems((prev) => {
        const map = new Map(prev.map((it) => [it.id, it]))
        for (const it of incoming) {
          const old = map.get(it.id)
          map.set(it.id, { ...it, fresh: old ? old.fresh : isNew })
        }
        const cutoff = Date.now() - 7 * 86400e3
        return [...map.values()].filter((it) => Date.parse(it.created) > cutoff).sort((a, b) => Date.parse(b.created) - Date.parse(a.created))
      })
      setUpdated(new Date())
      setState('ok')
    }

    const loadFile = async () => {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}data/launches.json?t=${Math.floor(Date.now() / 60000)}`)
        if (!res.ok) throw new Error(String(res.status))
        const j = (await res.json()) as FeedFile
        if (!alive) return
        setSources(j.sources ?? {})
        merge(j.items ?? [])
      } catch {
        /* the live Hacker News call below still fills the page */
      }
    }
    const loadHN = async () => {
      try {
        merge(await liveHN())
      } catch {
        if (alive) setState((s) => (s === 'loading' ? 'error' : s))
      }
    }

    loadFile()
      .then(loadHN)
      .finally(() => (ready = true))
    const tick = (fn: () => void) => () => document.visibilityState === 'visible' && fn()
    const a = window.setInterval(tick(loadFile), FILE_EVERY)
    const b = window.setInterval(tick(loadHN), HN_EVERY)
    return () => {
      alive = false
      window.clearInterval(a)
      window.clearInterval(b)
    }
  }, [])

  return { items, updated, sources, state }
}

export function ago(iso: string | Date, now = Date.now()) {
  const s = Math.max(0, (now - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'now'
  if (s < 3600) return `${Math.floor(s / 60)}m`
  if (s < 86400) return `${Math.floor(s / 3600)}h`
  return `${Math.floor(s / 86400)}d`
}

/** Re-renders every `ms` so relative times stay current. */
export function useNow(ms = 30_000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), ms)
    return () => window.clearInterval(id)
  }, [ms])
  return now
}
