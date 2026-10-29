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
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { clients } from '@/content'
import { ClientLogo } from './ClientLogo'

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

/** Logo height for the strip: smaller on phones. */
function useLogoSize() {
  const [s, set] = useState(() => (window.innerWidth < 640 ? 26 : window.innerWidth < 1024 ? 32 : 40))
  useEffect(() => {
    const on = () => set(window.innerWidth < 640 ? 26 : window.innerWidth < 1024 ? 32 : 40)
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return s
}

export function Marquee() {
  const size = useLogoSize()
  const items = (
    <span className="flex shrink-0 items-center">
      {clients.map((c) => (
        <span key={c.name} className="group flex shrink-0 flex-col items-center gap-2 px-7 sm:px-12">
          <span className="flex h-[clamp(34px,4.4vw,56px)] items-center text-on-deep/90 transition-colors duration-300 group-hover:text-soft">
            <ClientLogo name={c.name} height={size} />
          </span>
          <span className="text-xs text-on-deep-muted">{c.tag}</span>
        </span>
      ))}
    </span>
  )

  return (
    <section id="clients" aria-label="Selected clients" className="relative overflow-hidden bg-deep py-8 sm:py-12">
      <p className="shell mb-5 text-sm text-on-deep-muted sm:mb-7">Some of the companies we have launched</p>
      <VelocityRow baseVelocity={-2.2}>{items}</VelocityRow>
    </section>
  )
}
