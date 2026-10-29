import Lenis from 'lenis'
import { prefersReducedMotion } from './utils'

let lenis: Lenis | null = null

/** Starts Lenis smooth scrolling. Skipped when the visitor prefers reduced motion. */
export function startSmoothScroll() {
  if (lenis || prefersReducedMotion()) return () => {}
  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    autoRaf: true,
  })
  return () => {
    lenis?.destroy()
    lenis = null
  }
}

export const getLenis = () => lenis

export function scrollToHash(hash: string) {
  const el = document.querySelector(hash)
  if (!el) return
  if (lenis) lenis.scrollTo(el as HTMLElement, { offset: -20 })
  else el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
}
