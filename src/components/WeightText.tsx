import { useEffect, useRef, useState } from 'react'
import { cn, isFinePointer, prefersReducedMotion } from '@/lib/utils'

type Props = { text: string; className?: string; min?: number; max?: number; radius?: number }

/** Display text whose letters get heavier as the pointer nears them, using the font's weight axis. */
export function WeightText({ text, className, min = 200, max = 900, radius = 280 }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  // Touch screens and reduced motion get a fixed bold cut instead of the pointer effect.
  const [interactive] = useState(() => isFinePointer() && !prefersReducedMotion())
  const rest = interactive ? min : 700

  useEffect(() => {
    const root = ref.current
    if (!root || !interactive) return
    const letters = Array.from(root.querySelectorAll<HTMLSpanElement>('[data-l]'))
    const current = letters.map(() => min)
    let px = -9999
    let py = -9999
    let raf = 0
    let visible = false

    const onMove = (e: PointerEvent) => {
      px = e.clientX
      py = e.clientY
    }
    const tick = () => {
      if (visible) {
        // Read every rect before writing any style to avoid layout thrash.
        const rects = letters.map((el) => el.getBoundingClientRect())
        letters.forEach((el, i) => {
          const r = rects[i]
          const d = Math.hypot(px - (r.left + r.width / 2), py - (r.top + r.height / 2))
          const k = Math.max(0, 1 - d / radius)
          const target = min + (max - min) * k * k
          current[i] += (target - current[i]) * 0.18
          el.style.fontWeight = current[i].toFixed(0)
        })
      }
      raf = requestAnimationFrame(tick)
    }
    const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting))
    io.observe(root)
    window.addEventListener('pointermove', onMove, { passive: true })
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
    }
  }, [interactive, min, max, radius])

  return (
    <span ref={ref} className={cn('inline-block', className)}>
      <span className="sr-only">{text}</span>
      {text.split('').map((ch, i) => (
        <span key={i} data-l aria-hidden className="inline-block" style={{ fontWeight: rest }}>
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </span>
  )
}
