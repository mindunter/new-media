import { prefersReducedMotion } from './utils'

/*
 * Icon burst: launches platform logos and media icons out of a point with simple
 * physics (velocity, gravity, drag, spin), then fades them out. The icon artwork
 * is cloned from hidden sprites rendered once by <BurstSprites />, so bursts
 * cost no React renders. One shared rAF loop drives every live particle.
 */

type Particle = {
  el: HTMLElement
  x: number
  y: number
  vx: number
  vy: number
  r: number
  vr: number
  age: number
  life: number
  size: number
}

const MAX = 90
let layer: HTMLDivElement | null = null
let raf = 0
let last = 0
const live: Particle[] = []

function getLayer() {
  if (layer) return layer
  layer = document.createElement('div')
  layer.setAttribute('aria-hidden', 'true')
  layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:70;overflow:hidden'
  document.body.appendChild(layer)
  return layer
}

function step(now: number) {
  const dt = Math.min(48, now - (last || now)) / 16.67
  last = now
  for (let i = live.length - 1; i >= 0; i--) {
    const p = live[i]
    p.age += dt
    p.vy += 0.38 * dt
    p.vx *= Math.pow(0.985, dt)
    p.vy *= Math.pow(0.985, dt)
    p.x += p.vx * dt
    p.y += p.vy * dt
    p.r += p.vr * dt
    const t = p.age / p.life
    const pop = Math.min(1, p.age / 7)
    const scale = 0.3 + 0.7 * (1 - Math.pow(1 - pop, 3))
    const fade = t > 0.7 ? 1 - (t - 0.7) / 0.3 : 1
    p.el.style.transform = `translate3d(${p.x - p.size / 2}px, ${p.y - p.size / 2}px, 0) rotate(${p.r}deg) scale(${scale})`
    p.el.style.opacity = String(Math.max(0, fade))
    if (t >= 1 || p.y > window.innerHeight + 80) {
      p.el.remove()
      live.splice(i, 1)
    }
  }
  if (live.length) raf = requestAnimationFrame(step)
  else {
    raf = 0
    last = 0
  }
}

type Options = {
  count?: number
  /** Sprite ids to draw from. Defaults to every sprite. */
  only?: string[]
  /** Spread of launch angles in degrees, centred on straight up. */
  spread?: number
  power?: number
}

/** Bursts icons out of a viewport point (clientX, clientY). */
export function burst(x: number, y: number, { count = 14, only, spread = 300, power = 1 }: Options = {}) {
  if (prefersReducedMotion()) return
  const sprites = Array.from(document.querySelectorAll<HTMLElement>('[data-sprite]')).filter(
    (s) => !only || only.includes(s.dataset.sprite!),
  )
  if (!sprites.length) return
  const root = getLayer()
  const n = Math.min(count, MAX - live.length)
  for (let i = 0; i < n; i++) {
    const src = sprites[Math.floor(Math.random() * sprites.length)]
    const el = src.cloneNode(true) as HTMLElement
    el.removeAttribute('data-sprite')
    el.removeAttribute('hidden')
    const size = 48 + Math.random() * 26
    el.style.cssText = `position:absolute;left:0;top:0;width:${size}px;height:${size}px;will-change:transform,opacity`
    root.appendChild(el)
    const angle = ((-90 + (Math.random() - 0.5) * spread) * Math.PI) / 180
    const speed = (7 + Math.random() * 11) * power
    live.push({
      el,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: (Math.random() - 0.5) * 40,
      vr: (Math.random() - 0.5) * 14,
      age: 0,
      life: 70 + Math.random() * 45,
      size,
    })
  }
  if (!raf) raf = requestAnimationFrame(step)
}

/** Bursts from the centre of an element, e.g. a button that was just pressed. */
export function burstFrom(el: Element, opts?: Options) {
  const r = el.getBoundingClientRect()
  burst(r.left + r.width / 2, r.top + r.height / 2, opts)
}
