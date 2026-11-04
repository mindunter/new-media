import { AnimatePresence, motion } from 'motion/react'
import { ArrowUp, Heart, MessageSquare, Repeat2, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { cn, compact } from '@/lib/utils'
import { ago, trend, useNow, type LiveItem } from './feed'
import { spotlight, XLogo } from './ui'

const sourceName = { x: 'X', hn: 'Hacker News' } as const

/** A stable hue per site, so a launch without a preview image still gets its own tile. */
const hue = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7)

function SourceMark({ s }: { s: LiveItem['source'] }) {
  if (s === 'x') return <XLogo className="size-3.5" />
  return (
    <span aria-hidden className="grid size-3.5 place-items-center rounded-[3px] bg-fg/80 text-[0.55rem] leading-none font-bold text-page">
      Y
    </span>
  )
}

function Metrics({ it }: { it: LiveItem }) {
  const m = it.metrics
  const cell = 'flex items-center gap-1'
  if (it.source === 'hn') {
    return (
      <>
        <span className={cell} title="Points">
          <ArrowUp size={13} aria-hidden /> {compact(m.points ?? 0)}
        </span>
        <span className={cell} title="Comments">
          <MessageSquare size={12} aria-hidden /> {compact(m.comments ?? 0)}
        </span>
      </>
    )
  }
  return (
    <>
      <span className={cell} title="Likes">
        <Heart size={12} aria-hidden /> {compact(m.likes ?? 0)}
      </span>
      <span className={cell} title="Reposts">
        <Repeat2 size={13} aria-hidden /> {compact(m.reposts ?? 0)}
      </span>
    </>
  )
}

/** The launch's own preview image, or a generated tile with its site's initial. */
function Preview({ it }: { it: LiveItem }) {
  const [state, setState] = useState<'loading' | 'ok' | 'none'>(it.image ? 'loading' : 'none')
  const site = it.site ?? it.handle
  const h = hue(site)
  return (
    <div className="relative aspect-[1.91/1] overflow-hidden rounded-xl bg-fg/5">
      {state !== 'ok' && (
        <div
          className="absolute inset-0 grid place-items-center"
          style={{ background: `radial-gradient(120% 90% at 20% 0%, hsl(${h} 70% 55% / 0.28), transparent 60%), radial-gradient(100% 80% at 100% 100%, hsl(${(h + 60) % 360} 70% 50% / 0.22), transparent 60%)` }}
        >
          {state === 'loading' ? <span className="shimmer absolute inset-0" /> : <span className="num text-[2.4rem] font-semibold tracking-[-0.05em] text-fg/70 uppercase">{site.replace(/^www\./, '')[0]}</span>}
        </div>
      )}
      {it.image && state !== 'none' && (
        <img
          src={it.image}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onLoad={() => setState('ok')}
          onError={() => setState('none')}
          className={cn('h-full w-full object-cover transition-[opacity,transform] duration-700 group-hover:scale-[1.04]', state === 'ok' ? 'opacity-100' : 'opacity-0')}
        />
      )}
      {it.fresh && <span className="absolute top-2.5 left-2.5 rounded-full bg-fill px-2 py-0.5 text-[0.62rem] font-semibold tracking-wide text-white uppercase">New</span>}
    </div>
  )
}

/** One launch as a card: preview, title, source, and how it is doing. */
export function LiveCard({ it, now }: { it: LiveItem; now: number }) {
  return (
    <motion.li layout="position" initial={it.fresh ? { opacity: 0, y: -10 } : false} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
      <a
        href={it.url}
        target="_blank"
        rel="noreferrer"
        onPointerMove={spotlight}
        className="spot group flex h-full flex-col rounded-2xl border border-line bg-surface p-3 transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-fg/30"
      >
        <Preview it={it} />
        <div className="flex flex-1 flex-col px-1.5 pt-3.5 pb-1">
          <p className="line-clamp-2 min-h-[2.7em] text-[0.92rem] leading-snug font-medium">{it.title}</p>
          <div className="mt-auto flex items-center justify-between gap-3 pt-4 text-[0.76rem] text-muted">
            <span className="flex min-w-0 items-center gap-1.5">
              <SourceMark s={it.source} />
              <span className="truncate">{it.source === 'x' ? `@${it.handle}` : (it.site ?? it.kind)}</span>
            </span>
            <span className="num flex shrink-0 items-center gap-3">
              <Metrics it={it} />
              <time dateTime={it.created} title={new Date(it.created).toLocaleString()}>
                {ago(it.created, now)}
              </time>
            </span>
          </div>
        </div>
      </a>
    </motion.li>
  )
}

function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: [T, string][]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="flex shrink-0 rounded-full border border-line p-1 text-[0.82rem]">
      {options.map(([k, l]) => (
        <button key={k} type="button" aria-pressed={value === k} onClick={() => onChange(k)} className={cn('h-8 rounded-full px-3.5 font-medium whitespace-nowrap transition-colors', value === k ? 'bg-fg text-page' : 'text-muted hover:text-fg')}>
          {l}
        </button>
      ))}
    </div>
  )
}

/** The live feed: search, filters, and a grid of cards. */
export function Directory({ items }: { items: LiveItem[] }) {
  const now = useNow()
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<'new' | 'trend'>('new')
  const [src, setSrc] = useState<'all' | 'x' | 'hn'>('all')
  const [tag, setTag] = useState('All')
  const [limit, setLimit] = useState(24)

  const present = useMemo(() => (['x', 'hn'] as const).filter((s) => items.some((i) => i.source === s)), [items])
  const tags = useMemo(() => {
    const n = new Map<string, number>()
    for (const it of items) for (const t of it.tags) n.set(t, (n.get(t) ?? 0) + 1)
    return ['All', ...[...n.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t)]
  }, [items])

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const out = items.filter(
      (it) =>
        (src === 'all' || it.source === src) &&
        (tag === 'All' || it.tags.includes(tag)) &&
        (!needle || `${it.title} ${it.text ?? ''} ${it.handle} ${it.site ?? ''}`.toLowerCase().includes(needle)),
    )
    return sort === 'trend' ? out.sort((a, b) => trend(b) - trend(a)) : out
  }, [items, q, src, tag, sort])

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <label className="flex h-10 w-full items-center gap-2 rounded-full border border-line bg-surface px-4 text-[0.9rem] focus-within:border-fg/40 lg:max-w-sm">
          <Search size={15} aria-hidden className="text-muted" />
          <span className="sr-only">Search launches</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search launches" className="w-full bg-transparent outline-none placeholder:text-muted" />
        </label>
        <div className="flex flex-wrap gap-3">
          {present.length > 1 && (
            <Segmented label="Source" value={src} onChange={setSrc} options={[['all', 'All'], ...present.map((s) => [s, sourceName[s]] as ['x' | 'hn', string])]} />
          )}
          <Segmented
            label="Sort"
            value={sort}
            onChange={setSort}
            options={[
              ['new', 'Newest'],
              ['trend', 'Trending'],
            ]}
          />
        </div>
      </div>

      <div role="group" aria-label="Topic" className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {tags.map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={tag === t}
            onClick={() => setTag(t)}
            className={cn('h-8 shrink-0 rounded-full border px-3.5 text-[0.8rem] font-medium transition-colors', tag === t ? 'border-fg bg-fg text-page' : 'border-line text-muted hover:border-fg/40 hover:text-fg')}
          >
            {t}
          </button>
        ))}
      </div>

      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {!items.length &&
          Array.from({ length: 8 }, (_, k) => (
            <li key={k} className="rounded-2xl border border-line p-3">
              <span className="shimmer block aspect-[1.91/1] rounded-xl" />
              <span className="shimmer mt-4 block h-3 w-4/5 rounded-full" />
              <span className="shimmer mt-2.5 block h-3 w-1/2 rounded-full" />
            </li>
          ))}
        <AnimatePresence initial={false}>
          {list.slice(0, limit).map((it) => (
            <LiveCard key={it.id} it={it} now={now} />
          ))}
        </AnimatePresence>
      </ul>

      {items.length > 0 && !list.length && <p className="mt-12 text-muted">No launches match.</p>}

      {list.length > limit && (
        <div className="mt-10 flex justify-center">
          <button type="button" onClick={() => setLimit((n) => n + 24)} className="h-11 rounded-full px-5 text-[0.92rem] font-semibold ring-1 ring-fg/25 ring-inset transition-colors hover:bg-fg hover:text-page">
            Show more <span className="num ml-1 text-muted">{list.length - limit}</span>
          </button>
        </div>
      )}
    </div>
  )
}

/** "Updated 2m ago" with a pulsing dot. */
export function LiveStatus({ updated, count, className }: { updated: Date | null; count: number; className?: string }) {
  const now = useNow(15_000)
  return (
    <p className={cn('flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.84rem]', className)}>
      <span className="flex items-center gap-2 font-medium">
        <span aria-hidden className="live-dot" /> Live
      </span>
      <span className="opacity-70">{updated ? `Updated ${ago(updated, now) === 'now' ? 'just now' : `${ago(updated, now)} ago`}` : 'Connecting…'}</span>
      {count > 0 && (
        <span className="opacity-70">
          <span className="num">{count}</span> launches this week
        </span>
      )}
    </p>
  )
}
