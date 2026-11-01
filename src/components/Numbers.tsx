import { motion, useInView } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { asOf, backing, cta, fundingTotal, posts } from '@/content'
import { compact } from '@/lib/utils'
import { Button } from './Button'
import { ClientLogo } from './ClientLogo'
import { Reveal } from './Reveal'

const DAY = 86_400_000
const timeOf = (d: string) => new Date(`${d}T12:00:00Z`).getTime()
const label = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en', { month: 'short', day: 'numeric' })

/** Views adding up, post by post, from the first launch to the latest. */
function Climb() {
  const box = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(640)
  const [hover, setHover] = useState<number | null>(null)
  const inView = useInView(box, { once: true, margin: '-10% 0px' })

  useEffect(() => {
    if (!box.current) return
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width))
    ro.observe(box.current)
    return () => ro.disconnect()
  }, [])

  const data = posts.reduce<{ p: (typeof posts)[number]; total: number }[]>((all, p) => {
    all.push({ p, total: (all[all.length - 1]?.total ?? 0) + p.views })
    return all
  }, [])

  const H = 320
  const pad = { l: 8, r: 8, t: 24, b: 28 }
  const t0 = timeOf(data[0].p.date) - 6 * DAY
  const t1 = timeOf(data[data.length - 1].p.date) + 2 * DAY
  const max = 25_000_000
  const x = (d: string) => pad.l + ((timeOf(d) - t0) / (t1 - t0)) * (w - pad.l - pad.r)
  const y = (v: number) => pad.t + (1 - v / max) * (H - pad.t - pad.b)

  // Stepped, because views arrive with each launch.
  let line = `M${x(data[0].p.date) - 0},${y(0)}`
  for (const d of data) line += ` H${x(d.p.date)} V${y(d.total)}`
  const end = data[data.length - 1]
  const area = `${line} H${x(end.p.date)} V${y(0)} Z`

  const active = hover !== null ? data[hover] : null
  const big = data[1]

  const move = (e: React.PointerEvent<SVGRectElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const px = e.clientX - r.left
    let best = 0
    data.forEach((d, i) => {
      if (Math.abs(x(d.p.date) - px) < Math.abs(x(data[best].p.date) - px)) best = i
    })
    setHover(best)
  }

  return (
    <div ref={box} className="relative">
      <svg width={w} height={H} role="img" aria-label={`Cumulative views on nine launch posts, reaching ${compact(end.total)}`} className="block">
        {[0, 10_000_000, 20_000_000].map((v) => (
          <g key={v}>
            <line x1={pad.l} x2={w - pad.r} y1={y(v)} y2={y(v)} stroke="currentColor" strokeOpacity={v ? 0.1 : 0.25} />
            {v > 0 && (
              <text x={pad.l} y={y(v) - 6} fontSize={12} fill="var(--muted)">
                {compact(v)}
              </text>
            )}
          </g>
        ))}
        {['2026-05-05', '2026-07-08', '2026-10-20'].map((d) => (
          <text key={d} x={x(d)} y={H - 8} fontSize={12} fill="var(--muted)" textAnchor={d === '2026-10-20' ? 'end' : d === '2026-05-05' ? 'start' : 'middle'}>
            {label(d)}
          </text>
        ))}
        <motion.path d={area} fill="var(--fill)" initial={{ opacity: 0 }} animate={{ opacity: inView ? 0.14 : 0 }} transition={{ duration: 1.4, delay: 0.5 }} />
        <motion.path d={line} fill="none" stroke="var(--accent)" strokeWidth={2} strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: inView ? 1 : 0 }} transition={{ duration: 1.8, ease: 'easeInOut' }} />
        {data.map((d, i) => (
          <circle key={d.p.id} cx={x(d.p.date)} cy={y(d.total)} r={hover === i ? 6 : 4} fill="var(--accent)" stroke="var(--base)" strokeWidth={2} />
        ))}
        {/* Selective direct labels: the biggest jump and the total so far. */}
        {hover === null && (
          <>
            <text x={x(big.p.date) + 10} y={y(big.total) + 16} fontSize={13} fontWeight={600} fill="var(--fg)">
              {big.p.brand} comes out of stealth: +{compact(big.p.views)}
            </text>
            <text x={x(end.p.date)} y={y(end.total) - 12} fontSize={15} fontWeight={700} fill="var(--fg)" textAnchor="end">
              {compact(end.total)}
            </text>
          </>
        )}
        {active && <line x1={x(active.p.date)} x2={x(active.p.date)} y1={pad.t} y2={H - pad.b} stroke="currentColor" strokeOpacity={0.3} />}
        <rect x={0} y={0} width={w} height={H} fill="transparent" onPointerMove={move} onPointerLeave={() => setHover(null)} />
      </svg>
      {active && (
        <div
          className="pointer-events-none absolute top-1 w-48 rounded-xl bg-fg p-2.5 text-xs text-page shadow-lg"
          style={{ left: Math.min(Math.max(0, x(active.p.date) - 96), w - 192) }}
        >
          <p className="font-semibold">
            {active.p.brand}, {label(active.p.date)}
          </p>
          <p className="mt-0.5">+{compact(active.p.views)} on this post</p>
          <p>{compact(active.total)} in total</p>
        </div>
      )}
      <table className="sr-only">
        <caption>Views per launch post and running total</caption>
        <tbody>
          {data.map((d) => (
            <tr key={d.p.id}>
              <td>{d.p.brand}</td>
              <td>{d.p.date}</td>
              <td>{d.p.views}</td>
              <td>{d.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Funding announced, one thin bar per round, on the same scale. */
function Funding() {
  const ref = useRef<HTMLUListElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  const top = backing[0].amount
  return (
    <ul ref={ref} className="space-y-4">
      {backing.map((b, i) => (
        <li key={b.client} title={`${b.client}: ${b.raise}`}>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <span className="flex h-5 items-center">
              <ClientLogo name={b.client} height={15} />
            </span>
            <span className="text-sm font-semibold">${b.amount}M</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-fg/8">
            <motion.div
              className="h-full rounded-full bg-fill"
              initial={{ width: 0 }}
              animate={{ width: inView ? `${(b.amount / top) * 100}%` : 0 }}
              transition={{ duration: 1.1, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}

/** The numbers, drawn: views adding up over time, funding by round, and what people did with the posts. */
export function Numbers() {
  const sum = (k: 'likes' | 'bookmarks' | 'reposts' | 'replies') => posts.reduce((n, p) => n + p[k], 0)
  const actions = [
    { k: 'Likes', v: sum('likes') },
    { k: 'Bookmarks', v: sum('bookmarks') },
    { k: 'Reposts', v: sum('reposts') },
    { k: 'Replies', v: sum('replies') },
  ]
  return (
    <section aria-labelledby="climb-title" className="bg-page py-20 sm:py-28">
      <div className="shell">
        <Reveal>
          <p className="label-pill mb-4">Reliable</p>
          <h2 id="climb-title" className="display max-w-4xl text-[clamp(2.2rem,4.8vw,4.4rem)]">
            Launch after launch, <span className="serif italic">the line goes up.</span>
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]">
          <div className="border-grad min-w-0 rounded-3xl p-5 sm:p-7">
            <h3 className="text-[1.05rem] font-semibold">Views, adding up across nine posts</h3>
            <p className="mb-3 text-sm text-muted">Each step is one launch. Hover to see it.</p>
            <Climb />
          </div>
          <div className="border-grad rounded-3xl p-5 sm:p-7">
            <h3 className="text-[1.05rem] font-semibold">${fundingTotal}M announced</h3>
            <p className="mb-5 text-sm text-muted">Funding rounds launched through us</p>
            <Funding />
          </div>
        </div>

        <ul className="mt-5 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {actions.map((a) => (
            <li key={a.k} className="rounded-3xl bg-brand p-5 text-white sm:p-7">
              <p className="serif text-[clamp(2.2rem,4vw,3.4rem)] leading-none">{a.v.toLocaleString('en')}</p>
              <p className="mt-2 text-sm">{a.k} on those posts</p>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted">Figures from the public posts on X, as of {asOf}.</p>
          <Button href={cta.href} size="lg">
            {cta.label}
          </Button>
        </div>
      </div>
    </section>
  )
}
