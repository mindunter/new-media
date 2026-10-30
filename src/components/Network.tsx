import { Zap } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { network, partner } from '@/content'
import { burstFrom } from '@/lib/burst'
import { onThemeChange, tokenRGB } from '@/lib/theme'
import { cn, compact, prefersReducedMotion } from '@/lib/utils'
import { Reveal } from './Reveal'

type Node = {
  id: number
  group: number
  bx: number
  by: number
  x: number
  y: number
  vx: number
  vy: number
  r: number
  reach: number
  litAt: number
  from: number
}
type Edge = [number, number]


// Deterministic PRNG so the layout is the same on every visit.
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
}

function build(w: number, h: number) {
  const rand = rng(7)
  const count = w < 640 ? 90 : 170
  const cx = w / 2
  const cy = h / 2
  const groups = network.groups
  const nodes: Node[] = []
  const launch: Node = { id: 0, group: -1, bx: cx, by: cy, x: cx, y: cy, vx: 0, vy: 0, r: 9, reach: 0, litAt: -1, from: -1 }
  nodes.push(launch)

  groups.forEach((g, gi) => {
    const angle = (gi / groups.length) * Math.PI * 2 - Math.PI / 2
    const gx = cx + Math.cos(angle) * w * 0.3
    const gy = cy + Math.sin(angle) * h * 0.3
    const n = Math.round(count * g.share)
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2
      const d = Math.sqrt(rand()) * Math.min(w, h) * 0.2
      const x = Math.min(w - 12, Math.max(12, gx + Math.cos(a) * d * 1.3))
      const y = Math.min(h - 12, Math.max(12, gy + Math.sin(a) * d))
      const reach = g.reach * (0.3 + rand() * 1.7)
      nodes.push({
        id: nodes.length,
        group: gi,
        bx: x,
        by: y,
        x,
        y,
        vx: 0,
        vy: 0,
        r: 1.8 + Math.min(4.5, reach / 40_000),
        reach,
        litAt: -1,
        from: -1,
      })
    }
  })

  const edges: Edge[] = []
  const seen = new Set<string>()
  const add = (a: number, b: number) => {
    const k = a < b ? `${a}-${b}` : `${b}-${a}`
    if (a === b || seen.has(k)) return
    seen.add(k)
    edges.push([a, b])
  }
  for (let i = 1; i < nodes.length; i++) {
    const near = nodes
      .slice(1)
      .map((n) => ({ j: n.id, d: Math.hypot(n.bx - nodes[i].bx, n.by - nodes[i].by) }))
      .sort((p, q) => p.d - q.d)
      .slice(1, 3)
    near.forEach(({ j }) => add(i, j))
    if (rand() < 0.05) {
      const j = 1 + Math.floor(rand() * (nodes.length - 1))
      if (Math.hypot(nodes[j].bx - nodes[i].bx, nodes[j].by - nodes[i].by) < w * 0.35) add(i, j)
    }
  }
  // The launch post reaches a few seeded accounts in every group.
  groups.forEach((_, gi) => {
    const members = nodes.filter((n) => n.group === gi)
    for (let k = 0; k < 2; k++) add(0, members[Math.floor(rand() * members.length)].id)
  })
  // Bridge any island to the main graph so the cascade reaches every node.
  for (;;) {
    const reached = new Set([0])
    const stack = [0]
    while (stack.length) {
      const cur = stack.pop()!
      for (const [a, b] of edges) {
        const nb = a === cur ? b : b === cur ? a : -1
        if (nb >= 0 && !reached.has(nb)) {
          reached.add(nb)
          stack.push(nb)
        }
      }
    }
    if (reached.size === nodes.length) break
    let best: [number, number, number] = [0, 0, Infinity]
    for (const n of nodes) {
      if (reached.has(n.id)) continue
      for (const id of reached) {
        const d = Math.hypot(n.bx - nodes[id].bx, n.by - nodes[id].by)
        if (d < best[2]) best = [n.id, id, d]
      }
    }
    add(best[0], best[1])
  }
  return { nodes, edges }
}

/** Breadth-first cascade from the launch node. Each hop lands a little later. */
function cascade(nodes: Node[], edges: Edge[], start: number) {
  const adj = new Map<number, number[]>()
  edges.forEach(([a, b]) => {
    adj.set(a, [...(adj.get(a) ?? []), b])
    adj.set(b, [...(adj.get(b) ?? []), a])
  })
  nodes.forEach((n) => {
    n.litAt = -1
    n.from = -1
  })
  nodes[0].litAt = start
  const queue = [0]
  const rand = rng(Math.floor(start) + 3)
  while (queue.length) {
    const cur = queue.shift()!
    for (const nb of adj.get(cur) ?? []) {
      if (nodes[nb].litAt >= 0) continue
      const d = Math.hypot(nodes[nb].bx - nodes[cur].bx, nodes[nb].by - nodes[cur].by)
      nodes[nb].litAt = nodes[cur].litAt + 140 + d * 2.2 + rand() * 260
      nodes[nb].from = cur
      queue.push(nb)
    }
  }
}

export function Network() {
  const wrap = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const reachedRef = useRef<HTMLParagraphElement>(null)
  const nodesRef = useRef<HTMLSpanElement>(null)
  const fireRef = useRef<() => void>(() => {})
  const focusRef = useRef<number | null>(null)
  const [focus, setFocus] = useState<number | null>(null)
  const [tip, setTip] = useState<{ x: number; y: number; text: string } | null>(null)

  useEffect(() => {
    focusRef.current = focus
  }, [focus])

  useEffect(() => {
    const el = canvas.current
    const box = wrap.current
    if (!el || !box) return
    const ctx = el.getContext('2d')
    if (!ctx) return
    const reduced = prefersReducedMotion()
    // Canvas colors follow the light/dark tokens.
    let INK = ''
    let SIGNAL = ''
    const readColors = () => {
      INK = tokenRGB('--fg').join(',')
      SIGNAL = tokenRGB('--accent').join(',')
    }
    readColors()
    const offTheme = onThemeChange(readColors)

    let w = 0
    let h = 0
    let graph = build(1, 1)
    let raf = 0
    let visible = false
    let fired = false
    let fireStart = -1
    const pointer = { x: -999, y: -999 }

    const resize = () => {
      const r = el.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = r.width
      h = r.height
      el.width = Math.round(w * dpr)
      el.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      graph = build(w, h)
      if (fireStart >= 0) cascade(graph.nodes, graph.edges, fireStart)
    }

    const fire = () => {
      // With reduced motion the cascade is shown already complete.
      fireStart = performance.now() - (reduced ? 100_000 : 0)
      cascade(graph.nodes, graph.edges, fireStart)
    }
    fireRef.current = fire

    const draw = (now: number) => {
      ctx.clearRect(0, 0, w, h)
      const { nodes, edges } = graph
      const f = focusRef.current

      for (const n of nodes) {
        const dx = n.x - pointer.x
        const dy = n.y - pointer.y
        const d = Math.hypot(dx, dy)
        if (d < 90 && d > 0.1 && !reduced) {
          const push = (1 - d / 90) * 1.6
          n.vx += (dx / d) * push
          n.vy += (dy / d) * push
        }
        n.vx += (n.bx - n.x) * 0.06
        n.vy += (n.by - n.y) * 0.06
        n.vx *= 0.78
        n.vy *= 0.78
        n.x += n.vx
        n.y += n.vy
      }

      for (const [a, b] of edges) {
        const A = nodes[a]
        const B = nodes[b]
        const dim = f !== null && A.group !== f && B.group !== f
        ctx.strokeStyle = `rgba(${INK},${dim ? 0.03 : 0.09})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(A.x, A.y)
        ctx.lineTo(B.x, B.y)
        ctx.stroke()
      }

      // Pulses travelling along the edge each node was reached through.
      let reached = 0
      let lit = 0
      for (const n of nodes) {
        if (n.litAt < 0 || n.from < 0) continue
        const src = nodes[n.from]
        const t0 = src.litAt
        const t = (now - t0) / Math.max(1, n.litAt - t0)
        if (t > 0 && t < 1) {
          const px = src.x + (n.x - src.x) * t
          const py = src.y + (n.y - src.y) * t
          ctx.strokeStyle = `rgba(${SIGNAL},0.55)`
          ctx.lineWidth = 1.4
          ctx.beginPath()
          ctx.moveTo(src.x, src.y)
          ctx.lineTo(px, py)
          ctx.stroke()
        } else if (t >= 1) {
          ctx.strokeStyle = `rgba(${SIGNAL},0.16)`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(src.x, src.y)
          ctx.lineTo(n.x, n.y)
          ctx.stroke()
        }
      }

      for (const n of nodes) {
        const on = n.litAt >= 0 && now >= n.litAt
        if (on) {
          reached += n.reach
          lit++
        }
        const dim = f !== null && n.group !== f && n.group !== -1
        const grow = f !== null && n.group === f ? 1.5 : 1
        const age = on ? now - n.litAt : -1
        if (age >= 0 && age < 900 && !reduced) {
          const k = age / 900
          ctx.strokeStyle = `rgba(${SIGNAL},${0.5 * (1 - k)})`
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.arc(n.x, n.y, n.r * grow + k * 22, 0, Math.PI * 2)
          ctx.stroke()
        }
        if (n.group === -1) {
          ctx.fillStyle = `rgba(${SIGNAL},1)`
          ctx.beginPath()
          ctx.arc(n.x, n.y, n.r + Math.sin(now / 300) * 1.5, 0, Math.PI * 2)
          ctx.fill()
          ctx.strokeStyle = `rgba(${SIGNAL},0.25)`
          ctx.beginPath()
          ctx.arc(n.x, n.y, n.r + 8 + Math.sin(now / 300) * 2, 0, Math.PI * 2)
          ctx.stroke()
          continue
        }
        ctx.fillStyle = on ? `rgba(${SIGNAL},${dim ? 0.2 : 1})` : `rgba(${INK},${dim ? 0.12 : 0.55})`
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r * grow, 0, Math.PI * 2)
        ctx.fill()
      }

      if (reachedRef.current) reachedRef.current.textContent = Math.round(reached).toLocaleString('en')
      if (nodesRef.current) nodesRef.current.textContent = `${lit - (lit > 0 ? 1 : 0)} / ${nodes.length - 1}`
    }

    const loop = (now: number) => {
      if (visible) draw(now)
      raf = requestAnimationFrame(loop)
    }

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      pointer.x = e.clientX - r.left
      pointer.y = e.clientY - r.top
      let best: Node | null = null
      let bd = 18
      for (const n of graph.nodes) {
        const d = Math.hypot(n.x - pointer.x, n.y - pointer.y)
        if (d < bd) {
          bd = d
          best = n
        }
      }
      if (best && best.group >= 0) {
        setTip({ x: best.x, y: best.y, text: `${network.groups[best.group].label.replace(/s$/, '')} · ${compact(best.reach)} followers` })
      } else if (best) {
        setTip({ x: best.x, y: best.y, text: 'Your launch post' })
      } else setTip(null)
    }
    const onLeave = () => {
      pointer.x = -999
      pointer.y = -999
      setTip(null)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)
    const io = new IntersectionObserver(
      ([en]) => {
        visible = en.isIntersecting
        if (visible && !fired) {
          fired = true
          window.setTimeout(fire, 500)
        }
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      offTheme()
      ro.disconnect()
      io.disconnect()
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <section aria-labelledby="network-title" className="bg-page py-20 sm:py-28 lg:py-32">
      <div className="shell">
        <div className="mb-8 grid gap-5 sm:mb-10 md:grid-cols-2 md:items-end md:gap-10">
          <Reveal>
            <p className="label-pill mb-4">Network</p>
            <h2 id="network-title" className="display text-[clamp(2.2rem,5vw,4.8rem)]">
              Watch one post spread
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="max-w-md text-[1.05rem] leading-relaxed text-fg/70 sm:text-lg md:justify-self-end">
              45+ creators have already run campaigns with us. Each dot here is an account your buyers follow: press the
              button and follow a launch from the people we brief to everyone they reach.
            </p>
          </Reveal>
        </div>

        <div ref={wrap} className="overflow-hidden rounded-3xl border border-fg/10 bg-surface/60">
          <div className="relative">
            <canvas
              ref={canvas}
              className="block h-[min(62svh,640px)] min-h-[340px] w-full touch-pan-y sm:min-h-[420px]"
              aria-label="Animated map of creator accounts lighting up as a launch spreads"
              role="img"
            />

            {tip && (
              <div
                className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+14px)] rounded-full bg-deep px-3 py-1.5 text-xs font-medium whitespace-nowrap text-on-deep"
                style={{ left: tip.x, top: tip.y }}
              >
                {tip.text}
              </div>
            )}

            <div className="pointer-events-none absolute top-3 left-3 rounded-2xl bg-page/90 px-4 py-3 backdrop-blur-md sm:top-5 sm:left-5">
              <p className="text-xs font-semibold text-fg/60">Audience reached</p>
              <p ref={reachedRef} className="display mt-1 text-2xl sm:text-4xl">
                0
              </p>
              <p className="mt-1 text-xs text-fg/60">
                Accounts posting: <span ref={nodesRef}>0</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-fg/10 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
            <div
              className="-mx-3 flex gap-1.5 overflow-x-auto px-3 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
              role="group"
              aria-label="Highlight a group"
            >
              {network.groups.map((g, i) => (
                <button
                  key={g.id}
                  type="button"
                  aria-pressed={focus === i}
                  onClick={() => setFocus(focus === i ? null : i)}
                  onPointerEnter={(e) => e.pointerType === 'mouse' && setFocus(i)}
                  onPointerLeave={(e) => e.pointerType === 'mouse' && setFocus(null)}
                  className={cn(
                    'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    focus === i ? 'bg-fg text-page' : 'bg-page text-fg hover:bg-fg hover:text-page',
                  )}
                >
                  {g.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={(e) => {
                fireRef.current()
                burstFrom(e.currentTarget, { count: 16, spread: 220 })
              }}
              className="flex h-11 items-center justify-center gap-2 rounded-full bg-fill px-5 text-sm font-semibold text-white transition-colors hover:bg-[#2530c8]"
            >
              <Zap size={16} aria-hidden />
              Fire a launch
            </button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="label-pill">{partner.line}</p>
          <p className="text-xs text-muted">Sample network for illustration</p>
        </div>
      </div>
    </section>
  )
}
