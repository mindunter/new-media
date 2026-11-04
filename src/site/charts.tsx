import { motion, useInView } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

/*
 * Small, single-series charts. One hue (the accent), thin marks with rounded ends,
 * values in text colours, and a hover readout on every mark.
 */

export type Bar = { key: string; label: React.ReactNode; value: number; display: string; note?: string; href?: string }

/** Horizontal bars, ranked, with the value at the end of each bar. */
export function BarList({ bars, className, max }: { bars: Bar[]; className?: string; max?: number }) {
  const ref = useRef<HTMLOListElement>(null)
  const seen = useInView(ref, { once: true, margin: '-10% 0px' })
  const [hover, setHover] = useState<string | null>(null)
  const top = max ?? Math.max(...bars.map((b) => b.value))
  return (
    <ol ref={ref} className={cn('flex flex-col gap-2.5', className)}>
      {bars.map((b, k) => {
        const row = (
          <>
            <span className="num w-6 shrink-0 text-right text-[0.78rem] text-muted">{k + 1}</span>
            <span className="w-28 shrink-0 truncate text-[0.86rem] font-medium sm:w-36">{b.label}</span>
            <span className="relative h-6 flex-1">
              <motion.span
                className={cn('absolute inset-y-1 left-0 rounded-r-[4px] bg-accent transition-opacity', hover && hover !== b.key && 'opacity-35')}
                initial={{ width: 0 }}
                animate={{ width: seen ? `${Math.max(0.6, (b.value / top) * 100)}%` : 0 }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: k * 0.04 }}
              />
            </span>
            <span className="num w-16 shrink-0 text-right text-[0.86rem] font-medium">{b.display}</span>
          </>
        )
        return (
          <li key={b.key} onPointerEnter={() => setHover(b.key)} onPointerLeave={() => setHover(null)} title={b.note}>
            {b.href ? (
              <a href={b.href} target="_blank" rel="noreferrer" className="flex items-center gap-3">
                {row}
              </a>
            ) : (
              <div className="flex items-center gap-3">{row}</div>
            )}
          </li>
        )
      })}
    </ol>
  )
}

/** Tiny vertical bars for a stat tile, with a readout on hover. */
export function MiniBars({ values, labels, format, className }: { values: number[]; labels: string[]; format: (n: number) => string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const seen = useInView(ref, { once: true, margin: '-10% 0px' })
  const [i, setI] = useState<number | null>(null)
  const top = Math.max(...values)
  return (
    <div ref={ref} className={cn('relative', className)}>
      <div className="flex h-10 items-end gap-[3px]" onPointerLeave={() => setI(null)}>
        {values.map((v, k) => (
          <span key={k} className="flex h-full flex-1 items-end" onPointerEnter={() => setI(k)}>
            <motion.span
              className={cn('w-full rounded-t-[3px] bg-accent transition-opacity', i !== null && i !== k ? 'opacity-30' : 'opacity-80')}
              initial={{ height: 0 }}
              animate={{ height: seen ? `${Math.max(6, (v / top) * 100)}%` : 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: k * 0.03 }}
            />
          </span>
        ))}
      </div>
      <p className="num mt-2 h-4 truncate text-[0.74rem] text-muted">{i === null ? ' ' : `${labels[i]}  ${format(values[i])}`}</p>
    </div>
  )
}

/**
 * The shape of a launch: quiet preparation, a spike in the first hour, then a long tail.
 * Illustrative, not a client's data. Phases highlight in turn, or on hover.
 */
export function LaunchCurve({ phases, className }: { phases: { n: string; title: string; body: string }[]; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const seen = useInView(ref, { once: true, margin: '-15% 0px' })
  const [active, setActive] = useState(0)
  const [held, setHeld] = useState(false)

  useEffect(() => {
    if (!seen || held) return
    const id = window.setInterval(() => setActive((a) => (a + 1) % phases.length), 3200)
    return () => window.clearInterval(id)
  }, [seen, held, phases.length])

  // x in 0..1000, y in 0..300 (0 is the top). Each phase owns a slice of the x axis.
  const bounds = [0, 300, 470, 640, 1000]
  const path =
    'M0,288 C120,286 220,282 300,276 C360,270 420,262 470,250 C500,240 520,120 548,42 C566,8 590,40 620,92 C660,160 720,196 800,214 C880,228 940,232 1000,234'
  const area = `${path} L1000,300 L0,300 Z`

  return (
    <div ref={ref} className={className} onPointerLeave={() => setHeld(false)}>
      <div className="relative">
        <svg viewBox="0 0 1000 300" preserveAspectRatio="none" className="h-44 w-full sm:h-56" aria-hidden>
          <defs>
            <linearGradient id="lc-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--accent)" stopOpacity="0.28" />
              <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
            <clipPath id="lc-clip">
              <motion.rect x="0" y="0" height="300" initial={{ width: 0 }} animate={{ width: seen ? 1000 : 0 }} transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }} />
            </clipPath>
          </defs>
          {phases.map((_, k) => (
            <rect key={k} x={bounds[k]} y="0" width={bounds[k + 1] - bounds[k]} height="300" className="transition-[fill-opacity] duration-500" fill="var(--fg)" fillOpacity={active === k ? 0.05 : 0} />
          ))}
          {bounds.slice(1, -1).map((x) => (
            <line key={x} x1={x} x2={x} y1="0" y2="300" stroke="var(--line)" strokeDasharray="3 5" vectorEffect="non-scaling-stroke" />
          ))}
          <g clipPath="url(#lc-clip)">
            <path d={area} fill="url(#lc-fill)" />
            <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          </g>
        </svg>
        <span className="num absolute top-1 left-[54.8%] -translate-x-1/2 rounded-full bg-fill px-2 py-0.5 text-[0.68rem] font-medium text-white">hour 1</span>
      </div>
      <div className="grid grid-cols-4 border-t border-line">
        {phases.map((p, k) => (
          <button
            key={p.n}
            type="button"
            onPointerEnter={() => {
              setHeld(true)
              setActive(k)
            }}
            onFocus={() => {
              setHeld(true)
              setActive(k)
            }}
            onClick={() => setActive(k)}
            aria-pressed={active === k}
            className={cn('border-line pt-4 pr-3 text-left transition-colors', k > 0 && 'border-l pl-3 sm:pl-4', active === k ? 'text-fg' : 'text-muted hover:text-fg')}
          >
            <span className="num block text-[0.72rem]">{p.n}</span>
            <span className="mt-1 block text-[0.95rem] font-semibold">{p.title}</span>
          </button>
        ))}
      </div>
      <p className="mt-6 min-h-[3rem] max-w-xl text-[0.95rem] text-muted" aria-live="polite">
        {phases[active].body}
      </p>
      <p className="mt-2 text-[0.72rem] text-muted/70">Illustrative curve.</p>
    </div>
  )
}
