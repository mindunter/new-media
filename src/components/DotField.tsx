import { useEffect, useRef } from 'react'
import { onThemeChange, tokenRGB } from '@/lib/theme'
import { prefersReducedMotion } from '@/lib/utils'

type RGB = [number, number, number]

type Props = {
  className?: string
  /** Draw light dots for use on the always-dark bands. */
  onDeep?: boolean
}

const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]

/**
 * Responsive dot grid. Dots swell and take on the brand gradient near the
 * pointer, a tap or click sends a ripple through the grid (so touch screens get
 * the effect too), and a slow wave keeps it alive at rest. Grid spacing adapts
 * to the screen width, colours follow the light/dark tokens, and it pauses off
 * screen.
 */
export function DotField({ className, onDeep = false }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const reduced = prefersReducedMotion()

    let base: RGB = [0, 0, 0]
    let c1: RGB = [0, 0, 0]
    let c2: RGB = [0, 0, 0]
    let c3: RGB = [0, 0, 0]
    let baseAlpha = 0.14
    const readColors = () => {
      const dot = getComputedStyle(document.documentElement).getPropertyValue('--dot').split(',').map(Number) as RGB
      base = onDeep ? [245, 247, 255] : dot
      c1 = onDeep ? [111, 176, 255] : tokenRGB('--accent-3')
      c2 = onDeep ? [125, 151, 255] : tokenRGB('--accent')
      c3 = onDeep ? [111, 176, 255] : tokenRGB('--accent-2')
      baseAlpha = onDeep || document.documentElement.dataset.theme === 'dark' || base[0] > 200 ? 0.16 : 0.13
    }
    readColors()
    const offTheme = onThemeChange(() => {
      readColors()
      if (reduced) draw(0)
    })

    let w = 0
    let h = 0
    let gap = 28
    let raf = 0
    let visible = true
    const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999, active: 0 }
    const ripples: { x: number; y: number; t: number }[] = []

    const resize = () => {
      const r = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = r.width
      h = r.height
      gap = w < 640 ? 22 : w < 1024 ? 26 : 30
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const local = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      return [e.clientX - r.left, e.clientY - r.top]
    }
    const onMove = (e: PointerEvent) => {
      const [x, y] = local(e)
      pointer.tx = x
      pointer.ty = y
      if (pointer.x < -1000) {
        pointer.x = x
        pointer.y = y
      }
    }
    const onDown = (e: PointerEvent) => {
      const [x, y] = local(e)
      if (x < 0 || y < 0 || x > w || y > h) return
      ripples.push({ x, y, t: performance.now() })
      if (ripples.length > 4) ripples.shift()
    }

    const draw = (now: number) => {
      ctx.clearRect(0, 0, w, h)
      pointer.x += (pointer.tx - pointer.x) * 0.15
      pointer.y += (pointer.ty - pointer.y) * 0.15
      const inside = pointer.tx > 0 && pointer.ty > 0 && pointer.tx < w && pointer.ty < h
      pointer.active += ((inside ? 1 : 0) - pointer.active) * 0.08

      const R = Math.min(200, Math.max(110, w * 0.13))
      const time = now * 0.0006
      const cols = Math.ceil(w / gap) + 1
      const rows = Math.ceil(h / gap) + 1
      const ox = (w - (cols - 1) * gap) / 2
      const oy = (h - (rows - 1) * gap) / 2
      for (let k = ripples.length - 1; k >= 0; k--) if (now - ripples[k].t > 1400) ripples.splice(k, 1)

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          let x = ox + i * gap
          let y = oy + j * gap
          const wave = reduced ? 0 : Math.sin(i * 0.25 + j * 0.18 - time * 2) * 0.5 + 0.5

          const dx = x - pointer.x
          const dy = y - pointer.y
          const d = Math.hypot(dx, dy)
          const k0 = Math.max(0, 1 - d / R) * pointer.active
          let e = k0 * k0 * (3 - 2 * k0)
          if (e > 0 && d > 0.01) {
            x += (dx / d) * e * 10
            y += (dy / d) * e * 10
          }

          for (const rp of ripples) {
            const age = (now - rp.t) / 1400
            const rx = x - rp.x
            const ry = y - rp.y
            const rd = Math.hypot(rx, ry)
            const front = age * Math.max(w, h) * 0.9
            const band = Math.max(0, 1 - Math.abs(rd - front) / 60) * (1 - age)
            if (band > 0 && rd > 0.01) {
              x += (rx / rd) * band * 8
              y += (ry / rd) * band * 8
              e = Math.max(e, band)
            }
          }

          // Brand gradient across the width: sky blue to blue to violet.
          const tx = i / Math.max(1, cols - 1)
          const hot = tx < 0.5 ? mix(c1, c2, tx * 2) : mix(c2, c3, (tx - 0.5) * 2)
          const c = mix(base, hot, e)
          const a = baseAlpha + wave * 0.06 + e * 0.75
          const r = 0.9 + wave * 0.35 + e * 2.4
          ctx.fillStyle = `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`
          ctx.beginPath()
          ctx.arc(x, y, r, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    const loop = (now: number) => {
      if (visible) draw(now)
      raf = requestAnimationFrame(loop)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting))
    io.observe(canvas)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    if (reduced) draw(0)
    else raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      offTheme()
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
    }
  }, [onDeep])

  return <canvas ref={ref} aria-hidden className={className} />
}
