import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'motion/react'
import { useRef, type ReactNode } from 'react'
import { clients } from '@/content'

const wrap = (min: number, max: number, v: number) => {
  const r = max - min
  return ((((v - min) % r) + r) % r) + min
}

/** Horizontal loop whose speed and direction follow scroll velocity. */
function VelocityRow({ children, baseVelocity }: { children: ReactNode; baseVelocity: number }) {
  const reduced = useReducedMotion()
  const baseX = useMotionValue(0)
  const { scrollY } = useScroll()
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 })
  const factor = useTransform(velocity, [-2000, 0, 2000], [-5, 0, 5], { clamp: false })
  const skew = useTransform(velocity, [-3000, 0, 3000], [6, 0, -6])
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`)
  const dir = useRef(1)

  useAnimationFrame((_, delta) => {
    if (reduced) return
    let move = dir.current * baseVelocity * (delta / 1000)
    const f = factor.get()
    if (f < 0) dir.current = -1
    else if (f > 0) dir.current = 1
    move += dir.current * move * Math.abs(f)
    baseX.set(baseX.get() + move)
  })

  return (
    <div className="flex overflow-hidden whitespace-nowrap">
      <motion.div className="flex shrink-0 flex-nowrap" style={{ x, skewX: skew }}>
        {children}
        <span aria-hidden className="flex shrink-0">
          {children}
        </span>
      </motion.div>
    </div>
  )
}

export function Marquee() {
  const items = (
    <span className="flex shrink-0 items-center">
      {clients.map((c) => (
        <span key={c.name} className="group flex shrink-0 items-baseline gap-3 px-5 sm:px-8">
          <span className="display text-[clamp(1.9rem,4.2vw,4rem)] text-on-deep transition-colors duration-300 group-hover:text-soft">
            {c.name}
          </span>
          <span className="text-sm text-on-deep-muted">{c.tag}</span>
          <span aria-hidden className="ml-5 text-on-deep/25 sm:ml-8">/</span>
        </span>
      ))}
    </span>
  )

  return (
    <section aria-label="Selected clients" className="relative overflow-hidden bg-deep py-8 sm:py-12">
      <p className="shell mb-5 text-sm text-on-deep-muted sm:mb-7">Some of the companies we have launched</p>
      <VelocityRow baseVelocity={-2.2}>{items}</VelocityRow>
    </section>
  )
}
