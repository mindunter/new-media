import { AnimatePresence, motion } from 'motion/react'
import { ArrowUp, Heart, MessageSquare, Repeat2, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { cn, compact } from '@/lib/utils'
import { ago, trend, useNow, type LiveItem } from './feed'
import { XLogo } from './ui'

const sourceName = { x: 'X', hn: 'Hacker News' } as const

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
        <a href={it.discussion} target="_blank" rel="noreferrer" className={cn(cell, 'hover:text-fg')} title="Comments">
          <MessageSquare size={13} aria-hidden /> {compact(m.comments ?? 0)}
        </a>
      </>
    )
  }
  return (
    <>
      <span className={cell} title="Likes">
        <Heart size={13} aria-hidden /> {compact(m.likes ?? 0)}
      </span>
      <span className={cell} title="Reposts">
        <Repeat2 size={14} aria-hidden /> {compact(m.reposts ?? 0)}
      </span>
    </>
  )
}

/** One launch in the directory: when, what, who, and how it is doing. */
export function LiveRow({ it, now }: { it: LiveItem; now: number }) {
  return (
    <motion.li
      layout="position"
      initial={it.fresh ? { opacity: 0, y: -8 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="group grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-4 border-b border-line py-4 sm:grid-cols-[3.25rem_minmax(0,1fr)_auto]"
    >
      <time dateTime={it.created} title={new Date(it.created).toLocaleString()} className="pt-0.5 text-[0.82rem] text-muted tabular-nums">
        {ago(it.created, now)}
      </time>
      <div className="min-w-0">
        <a href={it.url} target="_blank" rel="noreferrer" className="flex items-start gap-2 text-[0.98rem] leading-snug font-medium hover:text-accent">
          <span className="line-clamp-2">{it.title}</span>
          {it.fresh && <span className="mt-0.5 shrink-0 rounded-full bg-fill px-1.5 py-px text-[0.62rem] font-semibold tracking-wide text-white uppercase">New</span>}
        </a>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8rem] text-muted">
          <span className="flex items-center gap-1.5 text-fg/75">
            <SourceMark s={it.source} />
            {it.source === 'x' ? `@${it.handle}` : (it.kind ?? 'Show HN')}
          </span>
          {it.site && <span className="truncate">{it.site}</span>}
          {it.tags.map((t) => (
            <span key={t} className="rounded-full border border-line px-2 py-px text-[0.72rem]">
              {t}
            </span>
          ))}
          <span className="flex items-center gap-3 sm:hidden">
            <Metrics it={it} />
          </span>
        </p>
      </div>
      <div className="hidden items-start gap-4 pt-0.5 text-[0.8rem] text-muted tabular-nums sm:flex">
        <Metrics it={it} />
      </div>
    </motion.li>
  )
}

function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: [T, string][]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="flex shrink-0 rounded-full border border-line p-1 text-[0.84rem]">
      {options.map(([k, l]) => (
        <button key={k} type="button" aria-pressed={value === k} onClick={() => onChange(k)} className={cn('rounded-full px-3.5 py-1.5 font-medium whitespace-nowrap transition-colors', value === k ? 'bg-fg text-page' : 'text-muted hover:text-fg')}>
          {l}
        </button>
      ))}
    </div>
  )
}

const dayKey = (iso: string) => new Date(iso).toDateString()
function dayLabel(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  const y = new Date(Date.now() - 86400e3)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === y.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })
}

/** The full directory: search, filters, and the list grouped by day. */
export function Directory({ items }: { items: LiveItem[] }) {
  const now = useNow()
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<'new' | 'trend'>('new')
  const [src, setSrc] = useState<'all' | 'x' | 'hn'>('all')
  const [tag, setTag] = useState('All')
  const [limit, setLimit] = useState(40)

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

  const shown = list.slice(0, limit)
  const groups: { key: string; label: string; rows: LiveItem[] }[] = []
  for (const it of shown) {
    if (sort === 'trend') {
      if (!groups.length) groups.push({ key: 'trend', label: 'Trending this week', rows: [] })
      groups[0].rows.push(it)
      continue
    }
    const k = dayKey(it.created)
    if (groups.at(-1)?.key !== k) groups.push({ key: k, label: dayLabel(it.created), rows: [] })
    groups.at(-1)!.rows.push(it)
  }

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <label className="flex h-11 w-full items-center gap-2 rounded-full border border-line bg-surface px-4 text-[0.92rem] focus-within:border-fg/40 lg:max-w-sm">
          <Search size={16} aria-hidden className="text-muted" />
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

      <div role="group" aria-label="Topic" className="mt-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {tags.map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={tag === t}
            onClick={() => setTag(t)}
            className={cn('shrink-0 rounded-full border px-3 py-1 text-[0.8rem] font-medium transition-colors', tag === t ? 'border-fg bg-fg text-page' : 'border-line text-muted hover:border-fg/40 hover:text-fg')}
          >
            {t}
          </button>
        ))}
      </div>

      {groups.map((g) => (
        <section key={g.key} aria-label={g.label} className="mt-10">
          <h3 className="mono-label border-b border-line pb-3">
            {g.label} <span className="ml-1 opacity-60">{g.rows.length}</span>
          </h3>
          <ul>
            <AnimatePresence initial={false}>
              {g.rows.map((it) => (
                <LiveRow key={it.id} it={it} now={now} />
              ))}
            </AnimatePresence>
          </ul>
        </section>
      ))}

      {!list.length && <p className="mt-12 text-muted">{items.length ? 'No launches match.' : 'Loading launches…'}</p>}

      {list.length > limit && (
        <div className="mt-8 flex justify-center">
          <button type="button" onClick={() => setLimit((n) => n + 40)} className="h-11 rounded-full px-5 text-[0.95rem] font-semibold ring-1 ring-fg/25 ring-inset transition-colors hover:bg-fg hover:text-page">
            Show more ({list.length - limit})
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
      {count > 0 && <span className="opacity-70">{count} launches this week</span>}
    </p>
  )
}
