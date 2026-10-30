import { animate, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { asOf, stats } from '@/content'
import { Reveal } from './Reveal'

function Counter({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-15% 0px' })
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!inView || !ref.current) return
    const el = ref.current
    const fmt = (v: number) => v.toLocaleString('en', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    if (reduced) {
      el.textContent = fmt(value)
      return
    }
    const controls = animate(0, value, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => (el.textContent = fmt(v)),
    })
    return () => controls.stop()
  }, [inView, value, decimals, reduced])

  const fmt = value.toLocaleString('en', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  return <span ref={ref}>{fmt}</span>
}

export function Stats() {
  return (
    <section aria-labelledby="numbers-title" className="bg-page py-20 sm:py-28">
      <div className="shell grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <Reveal>
          <p className="label-pill mb-4">Results</p>
          <h2 id="numbers-title" className="display text-[clamp(2.2rem,4.8vw,4.4rem)]">
            Reach you can't get from ads
          </h2>
          <p className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-muted sm:text-lg">
            Ten AI and tech companies since May 2026. Reactor and Sazabi each came back for three launches.
          </p>
          <p className="mt-4 text-sm text-muted">Figures from the launch posts on X, as of {asOf}.</p>
        </Reveal>

        <ul className="grid grid-cols-2 gap-x-6 gap-y-10 sm:gap-x-10">
          {stats.map((s) => (
            <li key={s.label}>
              <div className="border-t border-fg/15 pt-5">
                <p className="serif text-[clamp(2rem,8vw,3.4rem)] leading-none whitespace-nowrap lg:text-[clamp(3rem,5.2vw,5.4rem)]">
                  {'prefix' in s && s.prefix}
                  <Counter value={s.value} decimals={s.decimals} />
                  <span className="text-accent italic">{s.suffix}</span>
                </p>
                <p className="mt-2 max-w-[15rem] text-sm text-muted sm:text-base">{s.label}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
