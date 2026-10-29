import { motion, useMotionValueEvent, useSpring } from 'motion/react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { simulator } from '@/content'
import { cn } from '@/lib/utils'
import { Button } from './Button'
import { Reveal } from './Reveal'

const MIN = 10
const MAX = 200
const MAX_IMPRESSIONS = 20_000_000

function model(creators: number, typeMult: number, windowMult: number) {
  const network = 1 + Math.log10(creators) / 4
  return creators * simulator.viewsPerCreator * typeMult * windowMult * network
}

/** Builds an attention curve: quiet lead-in, spike at launch, decay whose length follows the window. */
function curvePath(total: number, days: number) {
  const W = 600
  const H = 220
  const peak = 20 + (H - 40) * (1 - Math.min(1, total / MAX_IMPRESSIONS))
  const n = 64
  const pts: [number, number][] = []
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const x = t * W
    let v: number
    if (t < 0.2) v = 0.04 + t * 0.5
    else {
      const k = (t - 0.2) / 0.8
      v = Math.exp(-k * (5.2 / Math.sqrt(days))) * (1 - Math.exp(-k * 22))
      v = Math.max(v, 0.08 + 0.06 * (1 - k))
    }
    pts.push([x, H - 10 - v * (H - 10 - peak)])
  }
  let d = `M ${pts[0][0]} ${pts[0][1]}`
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]
    const [x1, y1] = pts[i]
    const cx = (x0 + x1) / 2
    d += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`
  }
  return d
}

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { id: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  const id = useId()
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-semibold text-on-deep/70">{label}</legend>
      <div className="relative grid rounded-full bg-deep/25 p-1" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
        {options.map((o) => {
          const active = o.id === value
          return (
            <label key={o.id} className="relative cursor-pointer rounded-full px-1 py-2.5 text-center text-[0.8rem] whitespace-nowrap sm:text-sm">
              <input
                type="radio"
                name={id}
                value={o.id}
                checked={active}
                onChange={() => onChange(o.id)}
                className="peer sr-only"
              />
              {active && (
                <motion.span
                  layoutId={`seg-${id}`}
                  className="absolute inset-0 rounded-full bg-base"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <span className={cn('relative z-10 transition-colors', active ? 'text-fg' : 'text-on-deep/80')}>{o.label}</span>
              <span className="pointer-events-none absolute inset-0 rounded-full peer-focus-visible:ring-2 peer-focus-visible:ring-on-deep" />
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

export function Simulator() {
  const [type, setType] = useState(simulator.types[0].id)
  const [win, setWin] = useState(simulator.windows[1].id)
  const [creators, setCreators] = useState(60)

  const t = simulator.types.find((x) => x.id === type)!
  const w = simulator.windows.find((x) => x.id === win)!
  const total = model(creators, t.mult, w.mult)
  const d = useMemo(() => curvePath(total, w.days), [total, w.days])

  const spring = useSpring(total, { stiffness: 90, damping: 22 })
  useEffect(() => spring.set(total), [spring, total])
  const out = useRef<HTMLSpanElement>(null)
  useMotionValueEvent(spring, 'change', (v) => {
    if (out.current) out.current.textContent = Math.round(v).toLocaleString('en')
  })

  const split = [
    { k: 'X', v: 0.52 },
    { k: 'LinkedIn', v: 0.28 },
    { k: 'Shorts and Reels', v: 0.2 },
  ]
  const pct = ((creators - MIN) / (MAX - MIN)) * 100

  return (
    <section
      id="simulator"
      aria-labelledby="sim-title"
      className="bg-brand relative overflow-hidden py-20 text-white sm:py-28 lg:py-32"
    >
      <div className="shell">
        <div className="mb-8 grid gap-5 sm:mb-12 md:grid-cols-2 md:items-end md:gap-10">
          <Reveal>
            <p className="label-pill label-pill-dark mb-4">Simulator</p>
            <h2 id="sim-title" className="display text-[clamp(2.2rem,5vw,4.8rem)]">
              Estimate your launch
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="max-w-md text-[1.05rem] leading-relaxed text-on-deep/85 sm:text-lg md:justify-self-end">
              Change the inputs to see how reach grows with the number of creators posting. It's a rough model to start a
              conversation, not a quote.
            </p>
          </Reveal>
        </div>

        <Reveal>
          <div className="grid overflow-hidden rounded-3xl bg-deep md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)]">
            <div className="flex flex-col gap-7 bg-deep-2 p-5 sm:p-8">
              <Segmented label="What are you launching?" options={simulator.types} value={type} onChange={setType} />

              <div>
                <div className="mb-3 flex items-baseline justify-between">
                  <label htmlFor="creators" className="text-sm font-semibold text-on-deep/70">
                    Creators in the wave
                  </label>
                  <span className="display text-3xl">{creators}</span>
                </div>
                <div className="relative h-10">
                  <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-base/10" />
                  <div
                    className="absolute top-1/2 left-0 h-2 -translate-y-1/2 rounded-full bg-fill"
                    style={{ width: `${pct}%` }}
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-fg bg-base shadow-lg transition-transform"
                    style={{ left: `${pct}%` }}
                  />
                  <input
                    id="creators"
                    type="range"
                    min={MIN}
                    max={MAX}
                    step={5}
                    value={creators}
                    onChange={(e) => setCreators(Number(e.target.value))}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                </div>
                <div className="mt-2 flex justify-between text-xs text-on-deep/50">
                  <span>{MIN}</span>
                  <span>{MAX}</span>
                </div>
              </div>

              <Segmented label="Launch window" options={simulator.windows} value={win} onChange={setWin} />

              <div className="mt-auto flex flex-wrap gap-1.5" aria-hidden>
                {Array.from({ length: 40 }).map((_, i) => (
                  <motion.span
                    key={i}
                    className="h-3 w-3 rounded-full"
                    animate={{
                      backgroundColor: i < Math.round((creators / MAX) * 40) ? '#aaa0ff' : 'rgba(244,244,251,0.1)',
                      scale: i < Math.round((creators / MAX) * 40) ? 1 : 0.7,
                    }}
                    transition={{ duration: 0.3, delay: i * 0.004 }}
                  />
                ))}
              </div>
            </div>

            <div className="flex min-w-0 flex-col p-5 sm:p-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-on-deep/70">Projected impressions</p>
                  <p className="display mt-2 text-[clamp(2.2rem,5vw,4.6rem)]" aria-live="polite">
                    <span ref={out} className="tabular-nums">
                      {Math.round(total).toLocaleString('en')}
                    </span>
                  </p>
                </div>
                <p className="rounded-full border border-on-deep/20 px-3 py-1 text-xs text-on-deep/70">
                  Rough estimate
                </p>
              </div>

              <div className="relative mt-8 flex-1">
                <svg viewBox="0 0 600 220" preserveAspectRatio="none" className="h-56 w-full sm:h-72" aria-hidden>
                  <defs>
                    <linearGradient id="sim-fill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#5b4bff" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#5b4bff" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {[55, 110, 165].map((gy) => (
                    <line key={gy} x1="0" x2="600" y1={gy} y2={gy} stroke="rgba(238,235,228,0.08)" strokeDasharray="4 6" />
                  ))}
                  <line x1="120" x2="120" y1="0" y2="220" stroke="rgba(255,59,31,0.6)" strokeDasharray="3 5" />
                  <motion.path
                    animate={{ d: `${d} L 600 220 L 0 220 Z` }}
                    transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                    fill="url(#sim-fill)"
                  />
                  <motion.path
                    animate={{ d }}
                    transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                    fill="none"
                    stroke="#aaa0ff"
                    strokeWidth="2.5"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
                <div className="mt-2 flex justify-between text-xs text-on-deep/50">
                  <span>Day -7</span>
                  <span className="text-live">Launch</span>
                  <span>+{w.label}</span>
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {split.map((s) => (
                  <div key={s.k}>
                    <div className="flex justify-between text-sm">
                      <span className="text-on-deep/70">{s.k}</span>
                      <span className="font-semibold">{Math.round((total * s.v) / 1000).toLocaleString('en')}K</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-base/10">
                      <motion.div
                        className="h-full rounded-full bg-base"
                        animate={{ width: `${Math.min(100, (total * s.v * 100) / (MAX_IMPRESSIONS * 0.52))}%` }}
                        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10">
                <Button href="/contact" variant="signal">
                  Plan a launch like this
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
