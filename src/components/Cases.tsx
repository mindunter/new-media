import { motion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { cases } from '@/content'
import { cn } from '@/lib/utils'
import { Reveal } from './Reveal'

const tones = ['bg-deep text-on-deep', 'bg-surface text-fg', 'bg-brand text-white']

function useIsLarge() {
  const [large, setLarge] = useState(() => window.matchMedia('(min-width: 1024px)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const on = () => setLarge(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return large
}

function Card({
  c,
  i,
  progress,
  total,
}: {
  c: (typeof cases)[number]
  i: number
  progress: MotionValue<number>
  total: number
}) {
  const large = useIsLarge()
  const scale = useTransform(progress, [i / total, 1], [1, 1 - (total - i) * 0.035])
  const [lead, ...rest] = c.metrics

  return (
    // Cards stack on top of each other while scrolling on large screens; below that they are a plain list.
    <div
      className="lg:sticky lg:top-0 lg:flex lg:h-[100svh] lg:items-center lg:pt-[var(--stack)]"
      style={{ '--stack': `${i * 20}px` } as CSSProperties}
    >
      <motion.article
        style={large ? { scale } : undefined}
        className={cn(
          'relative flex w-full origin-top flex-col overflow-hidden rounded-3xl p-6 sm:p-10 lg:min-h-[60svh] lg:justify-between lg:p-12',
          tones[i % tones.length],
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-semibold">
          <p>{c.client}</p>
          <p className="opacity-90">{c.tag}</p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-end">
          <div>
            <h3 className="serif text-[clamp(2rem,4vw,4rem)] leading-[1.05] text-balance">{c.title}</h3>
            <p className="mt-5 max-w-xl text-[1.05rem] leading-relaxed opacity-90 sm:text-lg">{c.body}</p>
          </div>
          <div className="lg:text-right">
            <p className="serif text-[clamp(3.6rem,9vw,9rem)] leading-[0.85]">{lead.v}</p>
            <p className="mt-2 text-sm font-semibold opacity-90">{lead.k}</p>
          </div>
        </div>

        <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-current/20 pt-5 sm:max-w-md">
          {rest.map((m) => (
            <div key={m.k} className="flex flex-col-reverse gap-1">
              <dt className="text-sm opacity-90">{m.k}</dt>
              <dd className="display text-[clamp(1.6rem,2.6vw,2.4rem)]">{m.v}</dd>
            </div>
          ))}
        </dl>
      </motion.article>
    </div>
  )
}

export function Cases() {
  const container = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: container, offset: ['start start', 'end end'] })

  return (
    <section id="launches" aria-labelledby="cases-title" className="bg-base pt-20 pb-20 sm:pt-28 lg:pb-[10vh]">
      <div className="shell">
        <Reveal>
          <p className="label-pill mb-4">Work</p>
          <h2 id="cases-title" className="display text-[clamp(2.2rem,5vw,4.8rem)]">
            Recent launches
          </h2>
        </Reveal>
        <div ref={container} className="mt-8 flex flex-col gap-4 sm:mt-12 lg:mt-0 lg:block">
          {cases.map((c, i) => (
            <Card key={c.client} c={c} i={i} progress={scrollYProgress} total={cases.length} />
          ))}
        </div>
      </div>
    </section>
  )
}
