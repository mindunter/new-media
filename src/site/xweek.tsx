import { motion } from 'motion/react'
import { ArrowUpRight, Play } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import week from '@/data/x-week.json'
import { useTheme } from '@/lib/theme'
import { cn, compact } from '@/lib/utils'
import { BarList } from './charts'
import { ease, Sheet, spotlight, XLogo } from './ui'

/**
 * This week's top startup launches on X, ranked by views.
 *
 * src/data/x-week.json is a snapshot taken from public posts on X (see `asOf`).
 * When the launch scout runs with an X API token, refresh it from the scout's output.
 */

export type XLaunch = (typeof week.posts)[number]
export const xweek = week
const posts = [...week.posts].sort((a, b) => b.views - a.views)
const day = (iso: string) => new Date(iso).toLocaleDateString('en', { month: 'short', day: 'numeric' })
const url = (p: XLaunch) => `https://x.com/${p.handle}/status/${p.id}`
const engagement = (p: XLaunch) => (p.likes + p.reposts + p.replies + p.bookmarks) / Math.max(1, p.views)

/* ---------------------------- embeds ---------------------------- */

/**
 * The full post, rendered by X's own embed page. The page reports its height
 * through postMessage, so the frame fits the post exactly. A shimmer holds the
 * place until then.
 */
export function XEmbed({ id, className }: { id: string; className?: string }) {
  const box = useRef<HTMLDivElement>(null)
  const frame = useRef<HTMLIFrameElement>(null)
  const theme = useTheme()
  const [near, setNear] = useState(false)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    const el = box.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setNear(true), io.disconnect()), { rootMargin: '400px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const on = (e: MessageEvent) => {
      if (e.origin !== 'https://platform.twitter.com' || e.source !== frame.current?.contentWindow) return
      try {
        const msg = (typeof e.data === 'string' ? JSON.parse(e.data) : e.data)?.['twttr.embed']
        if (msg?.method === 'twttr.private.resize') setHeight(Math.ceil(msg.params?.[0]?.height ?? 0))
      } catch {
        /* not an embed message */
      }
    }
    window.addEventListener('message', on)
    return () => window.removeEventListener('message', on)
  }, [])

  const src = `https://platform.twitter.com/embed/Tweet.html?id=${id}&theme=${theme}&dnt=true&hideThread=true&lang=en`
  return (
    <div ref={box} className={cn('relative', className)}>
      {!height && (
        <div className="flex flex-col gap-3 rounded-2xl border border-line p-5">
          <div className="flex items-center gap-3">
            <span className="shimmer size-10 rounded-full" />
            <span className="shimmer h-3 w-32 rounded-full" />
          </div>
          <span className="shimmer h-3 w-full rounded-full" />
          <span className="shimmer h-3 w-4/5 rounded-full" />
          <span className="shimmer aspect-video w-full rounded-xl" />
        </div>
      )}
      {near && (
        <iframe
          ref={frame}
          key={src}
          src={src}
          title="Post on X"
          loading="lazy"
          scrolling="no"
          className={cn('w-full max-w-[550px] rounded-2xl border-0 transition-opacity duration-500', height ? 'relative opacity-100' : 'absolute inset-x-0 top-0 opacity-0')}
          style={{ height: height || 1, colorScheme: 'normal' }}
        />
      )}
    </div>
  )
}

/* ---------------------------- cards ---------------------------- */

function Thumb({ p, className }: { p: XLaunch; className?: string }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <div className={cn('relative overflow-hidden bg-fg/5', className)}>
      {p.image ? (
        <>
          {!loaded && <span className="shimmer absolute inset-0" />}
          <img
            src={p.image.replace('name=small', 'name=medium')}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            onLoad={() => setLoaded(true)}
            className={cn('h-full w-full object-cover transition-[opacity,transform] duration-700 group-hover:scale-[1.04]', loaded ? 'opacity-100' : 'opacity-0')}
          />
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col justify-end bg-[radial-gradient(120%_90%_at_0%_0%,color-mix(in_srgb,var(--accent)_18%,transparent),transparent_60%)] p-5">
          <p className="line-clamp-3 text-[0.86rem] leading-snug text-fg/75">{p.text.replace(/\s*\n+\s*/g, ' ')}</p>
        </div>
      )}
      {p.video && (
        <span className="absolute right-3 bottom-3 grid size-8 place-items-center rounded-full bg-black/60 text-white backdrop-blur">
          <Play size={13} fill="currentColor" aria-hidden />
        </span>
      )}
    </div>
  )
}

/** A launch as a thumbnail: rank, picture, company, views. Opens the full post. */
function LaunchTile({ p, rank, onOpen, big }: { p: XLaunch; rank: number; onOpen: (p: XLaunch) => void; big?: boolean }) {
  return (
    <button type="button" onClick={() => onOpen(p)} onPointerMove={spotlight} className="spot group flex h-full w-full flex-col rounded-2xl border border-line bg-surface p-3 text-left transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-fg/30">
      <div className="relative">
        <Thumb p={p} className="aspect-video rounded-xl" />
        <span className="num absolute top-3 left-3 rounded-full bg-black/65 px-2.5 py-1 text-[0.74rem] font-medium text-white backdrop-blur">#{rank}</span>
      </div>
      <div className="flex flex-1 flex-col px-2 pt-4 pb-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={cn('truncate font-semibold', big ? 'text-[1.05rem]' : 'text-[0.95rem]')}>{p.company}</p>
            <p className="mt-0.5 truncate text-[0.8rem] text-muted">
              {p.kind} · {p.sector}
            </p>
          </div>
          <XLogo className="mt-1 size-3.5 shrink-0 text-muted transition-colors group-hover:text-fg" />
        </div>
        <div className="mt-auto flex items-end justify-between pt-4">
          <p className="leading-none">
            <span className={cn('num font-medium', big ? 'text-[1.6rem]' : 'text-[1.25rem]')}>{compact(p.views)}</span>
            <span className="ml-1.5 text-[0.78rem] text-muted">views</span>
          </p>
          <span className="num text-[0.78rem] text-muted">{day(p.date)}</span>
        </div>
      </div>
    </button>
  )
}

function useOpenPost() {
  const [open, setOpen] = useState<XLaunch | null>(null)
  const sheet = (
    <Sheet open={!!open} onClose={() => setOpen(null)} title={open ? `${open.company} on X` : 'Post'}>
      {open && (
        <div>
          <p className="mono-label">
            {open.kind} · {open.sector}
          </p>
          <h2 className="display mt-2 text-[1.4rem] tracking-[-0.03em]">{open.company}</h2>
          <dl className="num mt-4 grid grid-cols-4 gap-3 border-y border-line py-4 text-[0.78rem] text-muted">
            {(
              [
                ['Views', open.views],
                ['Likes', open.likes],
                ['Reposts', open.reposts],
                ['Bookmarks', open.bookmarks],
              ] as const
            ).map(([k, v]) => (
              <div key={k}>
                <dd className="text-[1.05rem] font-medium text-fg">{compact(v)}</dd>
                <dt>{k}</dt>
              </div>
            ))}
          </dl>
          <XEmbed id={open.id} className="mt-5" />
          <a href={url(open)} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-1 text-[0.9rem] font-semibold hover:text-accent">
            Open on X <ArrowUpRight size={15} />
          </a>
        </div>
      )}
    </Sheet>
  )
  return [setOpen, sheet] as const
}

/* ---------------------------- sections ---------------------------- */

/** #1 to #3 this week, large. */
export function TopThisWeek() {
  const [open, sheet] = useOpenPost()
  return (
    <>
      <ul className="grid gap-5 md:grid-cols-3">
        {posts.slice(0, 3).map((p, k) => (
          <motion.li key={p.id} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease, delay: k * 0.08 }}>
            <LaunchTile p={p} rank={k + 1} onOpen={open} big />
          </motion.li>
        ))}
      </ul>
      {sheet}
    </>
  )
}

/** The week in numbers and two ranked charts. */
export function Breakdown() {
  const total = posts.reduce((n, p) => n + p.views, 0)
  const sortedViews = posts.map((p) => p.views).sort((a, b) => a - b)
  const median = sortedViews[Math.floor(sortedViews.length / 2)]
  const best = [...posts].sort((a, b) => engagement(b) - engagement(a))[0]
  const kinds = useMemo(() => {
    const m = new Map<string, number[]>()
    for (const p of posts) m.set(p.kind, [...(m.get(p.kind) ?? []), p.views])
    return [...m.entries()].map(([k, v]) => ({ k, n: v.length, total: v.reduce((a, b) => a + b, 0) })).sort((a, b) => b.total - a.total)
  }, [])
  const tiles = [
    { v: compact(total), k: 'Views across the top launches' },
    { v: compact(median), k: 'Median views per launch' },
    { v: `${(engagement(best) * 100).toFixed(1)}%`, k: `Top engagement rate, ${best.company}` },
  ]
  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
      <div>
        <p className="mono-label">Views by launch</p>
        <BarList
          className="mt-5"
          bars={posts.map((p) => ({ key: p.id, label: p.company, value: p.views, display: compact(p.views), note: `${p.kind}, ${day(p.date)}`, href: url(p) }))}
        />
      </div>
      <div className="flex flex-col gap-10">
        <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-line bg-line">
          {tiles.map((t) => (
            <div key={t.k} className="bg-page p-4 sm:p-5">
              <dd className="num text-[clamp(1.3rem,2vw,1.7rem)] leading-none font-medium">{t.v}</dd>
              <dt className="mt-2 text-[0.76rem] leading-snug text-muted">{t.k}</dt>
            </div>
          ))}
        </dl>
        <div>
          <p className="mono-label">Views by launch type</p>
          <BarList className="mt-5" bars={kinds.map((x) => ({ key: x.k, label: x.k, value: x.total, display: compact(x.total), note: `${x.n} launch${x.n > 1 ? 'es' : ''}` }))} />
        </div>
      </div>
    </div>
  )
}

/** Every launch of the week as a thumbnail, ranked by views on X, filterable by type. */
export function WeekGrid() {
  const [open, sheet] = useOpenPost()
  const kinds = ['All', ...new Set(posts.map((p) => p.kind))]
  const [kind, setKind] = useState('All')
  const list = posts.filter((p) => kind === 'All' || p.kind === kind)
  return (
    <>
      <div role="group" aria-label="Launch type" className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {kinds.map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={kind === k}
            onClick={() => setKind(k)}
            className={cn('h-8 shrink-0 rounded-full border px-3.5 text-[0.8rem] font-medium transition-colors', kind === k ? 'border-fg bg-fg text-page' : 'border-line text-muted hover:border-fg/40 hover:text-fg')}
          >
            {k}
          </button>
        ))}
      </div>
      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((p) => (
          <motion.li key={p.id} layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
            <LaunchTile p={p} rank={posts.indexOf(p) + 1} onOpen={open} />
          </motion.li>
        ))}
      </ul>
      {sheet}
    </>
  )
}

/** The full posts, embedded from X, in three columns. */
export function EmbedWall({ count = 6 }: { count?: number }) {
  return (
    <ul className="grid items-start justify-items-center gap-5 md:grid-cols-2 xl:grid-cols-3">
      {posts.slice(0, count).map((p) => (
        <li key={p.id} className="w-full max-w-[550px]">
          <XEmbed id={p.id} />
        </li>
      ))}
    </ul>
  )
}
