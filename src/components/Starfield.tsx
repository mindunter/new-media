import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/lib/utils'

type Star = { x: number; y: number; r: number; a: number; tw: number; ph: number; z: number }

/**
 * Deep-space backdrop: twinkling stars that drift slowly, and now and then a
 * shooting star. Pauses when off screen; a still sky for reduced motion.
 */
export function Starfield({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = ref.current
    const ctx = cv?.getContext('2d')
    if (!cv || !ctx) return
    const still = prefersReducedMotion()
    let w = 0
    let h = 0
    let stars: Star[] = []
    let raf = 0
    let visible = true
    let shot: { x: number; y: number; vx: number; vy: number; life: number } | null = null
    let nextShot = performance.now() + 2500

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      w = cv.clientWidth
      h = cv.clientHeight
      cv.width = Math.round(w * dpr)
      cv.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const n = Math.round((w * h) / 2600)
      stars = Array.from({ length: n }, () => {
        const z = Math.random()
        return { x: Math.random() * w, y: Math.random() * h, r: 0.3 + z * z * 1.4, a: 0.25 + z * 0.75, tw: 0.6 + Math.random() * 1.8, ph: Math.random() * 6.28, z }
      })
    }

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h)
      for (const s of stars) {
        if (!still) s.x -= (0.02 + s.z * 0.08)
        if (s.x < -2) s.x = w + 2
        const a = s.a * (still ? 1 : 0.65 + 0.35 * Math.sin(t * 0.001 * s.tw + s.ph))
        ctx.globalAlpha = a
        ctx.fillStyle = s.z > 0.92 ? '#cfe0ff' : '#ffffff'
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, 6.283)
        ctx.fill()
      }
      if (!still) {
        if (!shot && t > nextShot) {
          shot = { x: w * (0.35 + Math.random() * 0.6), y: h * Math.random() * 0.35, vx: -7, vy: 2.6, life: 1 }
          nextShot = t + 5000 + Math.random() * 6000
        }
        if (shot) {
          const g = ctx.createLinearGradient(shot.x, shot.y, shot.x - shot.vx * 14, shot.y - shot.vy * 14)
          g.addColorStop(0, `rgba(255,255,255,${0.9 * shot.life})`)
          g.addColorStop(1, 'rgba(255,255,255,0)')
          ctx.globalAlpha = 1
          ctx.strokeStyle = g
          ctx.lineWidth = 1.4
          ctx.beginPath()
          ctx.moveTo(shot.x, shot.y)
          ctx.lineTo(shot.x - shot.vx * 14, shot.y - shot.vy * 14)
          ctx.stroke()
          shot.x += shot.vx
          shot.y += shot.vy
          shot.life -= 0.012
          if (shot.life <= 0) shot = null
        }
      }
      ctx.globalAlpha = 1
    }

    const loop = (t: number) => {
      draw(t)
      if (visible && !still) raf = requestAnimationFrame(loop)
    }

    size()
    draw(0)
    const ro = new ResizeObserver(() => {
      size()
      draw(performance.now())
    })
    ro.observe(cv)
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      cancelAnimationFrame(raf)
      if (visible && !still) raf = requestAnimationFrame(loop)
    })
    io.observe(cv)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
    }
  }, [])

  return <canvas ref={ref} aria-hidden className={className} />
}
