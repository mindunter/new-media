import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, X } from 'lucide-react'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { asOf, clientCard, clients, cta, hero } from '@/content'
import { burst } from '@/lib/burst'
import { art } from '@/lib/paths'
import { prefersReducedMotion } from '@/lib/utils'
import { Button } from './Button'
import { ClientLogo } from './ClientLogo'
import { DotField } from './DotField'
import { Sky } from './Sky'

const HeroWorld = lazy(() => import('../three/HeroWorld'))
const ease = [0.16, 1, 0.3, 1] as const

/** Waits until the hero is near the viewport and the page is idle. Reduced motion keeps the still image. */
function use3D(stage: React.RefObject<HTMLElement | null>) {
  const [ok, setOk] = useState(false)
  useEffect(() => {
    const el = stage.current
    if (!el || prefersReducedMotion()) return
    let idle = 0
    const io = new IntersectionObserver(
      ([en]) => {
        if (!en.isIntersecting) return
        io.disconnect()
        // The page animates constantly, so idle time can be rare: cap the wait.
        if ('requestIdleCallback' in window) idle = window.requestIdleCallback(() => setOk(true), { timeout: 1200 })
        else globalThis.setTimeout(() => setOk(true), 600)
      },
      { rootMargin: '300px' },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      if (idle && 'cancelIdleCallback' in window) window.cancelIdleCallback(idle)
    }
  }, [stage])
  return ok
}

function useIsDark() {
  const [dark, setDark] = useState(false)
  useEffect(() => {
    const root = document.documentElement
    const read = () => setDark(root.dataset.theme === 'dark')
    read()
    const mo = new MutationObserver(read)
    mo.observe(root, { attributes: true, attributeFilter: ['data-theme'] })
    return () => mo.disconnect()
  }, [])
  return dark
}

function useCompact() {
  const [compact, setCompact] = useState(() => !window.matchMedia('(min-width: 1024px)').matches)
  useEffect(() => {
    const m = window.matchMedia('(min-width: 1024px)')
    const on = () => setCompact(!m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])
  return compact
}

/** A client's numbers, opened by clicking its bird. */
function BirdCard({ name, at, onClose }: { name: string; at: { x: number; y: number }; onClose: () => void }) {
  const c = clientCard(name)
  const close = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    close.current?.focus({ preventScroll: true })
    const key = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [onClose])

  const figures = [
    { k: 'Likes', v: c.likes },
    { k: 'Bookmarks', v: c.bookmarks },
    { k: 'Reposts', v: c.reposts },
  ].filter((f) => f.v > 0)

  return (
    <motion.div
      role="dialog"
      aria-label={`${name} launch numbers`}
      initial={{ opacity: 0, scale: 0.7, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: 10 }}
      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
      style={{ '--x': `${at.x}px`, '--y': `${at.y}px` } as React.CSSProperties}
      className="pointer-events-auto fixed inset-x-3 bottom-3 z-40 rounded-3xl bg-page p-5 text-fg shadow-[0_30px_70px_-20px_rgb(4_30_90/0.6)] ring-1 ring-fg/10 dark:bg-surface dark:ring-white/25 lg:absolute lg:inset-x-auto lg:bottom-auto lg:top-[var(--y)] lg:left-[var(--x)] lg:w-[340px]"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex h-7 items-center">
          <ClientLogo name={name} height={22} />
        </span>
        <button ref={close} type="button" onClick={onClose} aria-label="Close" className="grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-fg/10 hover:text-fg">
          <X size={18} aria-hidden />
        </button>
      </div>

      {c.stat ? (
        <p className="serif mt-3 text-[3.4rem] leading-none text-accent">{c.stat}</p>
      ) : (
        <p className="serif mt-3 text-[2rem] leading-tight italic">Launched with us</p>
      )}
      <p className="mt-1 text-sm text-muted">{c.detail}</p>

      {figures.length > 0 && (
        <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-fg/12 pt-3">
          {figures.map((f) => (
            <div key={f.k}>
              <dd className="text-[1.05rem] font-semibold">{f.v.toLocaleString('en')}</dd>
              <dt className="text-xs text-muted">{f.k}</dt>
            </div>
          ))}
        </dl>
      )}

      {c.backing && (
        <p className="mt-3 border-t border-fg/12 pt-3 text-sm text-muted">
          <span className="font-semibold text-fg">{c.backing.raise}</span> from {c.backing.firms.slice(0, 3).join(', ')}
          {c.backing.firms.length > 3 && ` and ${c.backing.firms.length - 3} more`}
        </p>
      )}

      <div className="mt-4 flex items-center gap-2">
        <Button href={cta.href} size="md" className="flex-1">
          {cta.label}
        </Button>
        {c.url && (
          <a href={c.url} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-1 rounded-full px-4 text-[0.95rem] font-semibold text-fg ring-1 ring-fg/20 ring-inset transition-colors hover:bg-fg hover:text-page">
            On X <ArrowUpRight size={16} aria-hidden />
          </a>
        )}
      </div>
    </motion.div>
  )
}

/** Hero: the promise and one action, in front of a live world of grass, a TV and client birds. */
export function Hero() {
  const stage = useRef<HTMLDivElement>(null)
  const section = useRef<HTMLElement>(null)
  const load3d = use3D(stage)
  const dark = useIsDark()
  const compact = useCompact()
  const [ready, setReady] = useState(false)
  const [picked, setPicked] = useState<string | null>(null)
  const [at, setAt] = useState({ x: 0, y: 0 })
  const [still] = useState(() => prefersReducedMotion())

  const open = (name: string, x: number, y: number) => {
    const r = section.current?.getBoundingClientRect()
    if (r) {
      // Keep the card inside the hero, next to the bird.
      setAt({
        x: Math.min(Math.max(16, x - r.left + 18), r.width - 356),
        y: Math.min(Math.max(90, y - r.top - 60), r.height - 400),
      })
    }
    setPicked(name)
  }

  return (
    <section
      ref={section}
      id="top"
      className="relative isolate overflow-hidden bg-page text-white"
      onPointerDown={(e) => {
        // Clicking empty space sets off a launch: logos and devices burst from the pointer.
        if ((e.target as HTMLElement).closest('a, button, canvas, [role="dialog"]')) return
        burst(e.clientX, e.clientY, { count: 12 })
      }}
    >
      <Sky priority scrim className="bottom-auto h-[92%]" />
      <DotField
        onDeep
        className="absolute inset-0 -z-10 h-full w-full opacity-40 [mask-image:linear-gradient(to_bottom,black_0%,black_34%,transparent_58%)]"
      />

      {/* The whole hero is the 3D stage on desktop; on smaller screens it is a band below the text. */}
      {load3d && (
        <Suspense fallback={null}>
          <div className={`absolute inset-x-0 bottom-0 h-[480px] transition-opacity duration-1000 lg:top-0 lg:h-auto ${ready ? 'opacity-100' : 'opacity-0'}`}>
            <HeroWorld compact={compact} dark={dark} picked={picked} onPick={open} onMiss={() => setPicked(null)} onReady={() => setReady(true)} />
          </div>
        </Suspense>
      )}

      <div className="shell pointer-events-none relative z-10 grid items-center gap-6 pt-28 pb-0 sm:pt-32 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-10 lg:pt-32 lg:pb-24">
        <div className="[&>*]:pointer-events-auto">
          <motion.p
            className="label-pill label-pill-dark mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
          >
            {hero.eyebrow}
          </motion.p>

          <h1 className="display [text-shadow:0_2px_24px_rgb(5_40_120/0.3)] text-[clamp(2.7rem,7.5vw,4.6rem)] lg:text-[clamp(3.4rem,4.7vw,5rem)]">
            {hero.lines.map((line, i) => {
              const last = i === hero.lines.length - 1
              return (
                <span key={line} className="block overflow-hidden pb-[0.12em] lg:whitespace-nowrap">
                  <motion.span
                    className={last ? 'serif inline-block pr-[0.08em] italic' : 'inline-block'}
                    initial={{ y: '105%' }}
                    animate={{ y: '0%' }}
                    transition={{ duration: 1, ease, delay: 0.1 + i * 0.08 }}
                  >
                    {line}
                  </motion.span>{' '}
                </span>
              )
            })}
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.45 }}
          >
            <p className="mt-5 max-w-[34rem] text-[1.05rem] leading-relaxed text-white/95 text-pretty [text-shadow:0_1px_12px_rgb(5_40_120/0.35)] sm:text-lg">
              {hero.sub}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button href={cta.href} variant="light" size="lg" className="max-sm:flex-1">
                {cta.label}
              </Button>
              <Button href="/work" variant="outlineDark" size="lg" arrow={false} className="bg-[#062a78]/50 !text-white ring-white/30 backdrop-blur-md hover:!text-[#0b0c14] max-sm:flex-1">
                {hero.secondary}
              </Button>
            </div>
            <p className="mt-6 w-fit max-w-full rounded-2xl bg-[#062a78]/70 px-4 py-2.5 text-sm text-white ring-1 ring-white/20 backdrop-blur-md">
              <span className="font-semibold">{hero.proof}</span> As of {asOf}.
            </p>
          </motion.div>
        </div>

        {/* Reserves the 3D band on small screens. A still render shows until the live scene is ready. */}
        <div ref={stage} className="relative mx-auto h-[480px] w-full max-w-[600px] lg:aspect-[4/3] lg:h-auto">
          <img
            src={art('obj-tv.webp')}
            alt="A glossy blue retro TV showing Reactor's launch: 12.7M views"
            fetchPriority="high"
            className={`absolute inset-[6%] h-[88%] w-[88%] object-contain transition-opacity duration-700 ${ready ? 'opacity-0' : 'opacity-100'}`}
          />
          {ready && !picked && (
            <p className="absolute top-3 right-0 left-0 mx-auto w-fit rounded-full bg-[#062a78]/70 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/25 backdrop-blur-md lg:top-auto lg:right-auto lg:-bottom-20 lg:left-1/2 lg:-translate-x-1/2">
              {compact ? 'Tap a bird to see its numbers' : 'Each bird is a client. Click one.'}
            </p>
          )}
        </div>
      </div>

      {/* Birds cannot be reached by keyboard, so the same cards open from these. They show for reduced motion too. */}
      <ul
        aria-label="Client launch numbers"
        className={
          still
            ? 'shell relative flex flex-wrap gap-2 pb-8'
            : 'sr-only focus-within:not-sr-only focus-within:shell focus-within:relative focus-within:flex focus-within:flex-wrap focus-within:gap-2 focus-within:pb-8'
        }
      >
        {clients.map((c) => (
          <li key={c.name}>
            <button
              type="button"
              onClick={(e) => open(c.name, e.clientX, e.clientY)}
              className="rounded-full bg-[#062a78]/70 px-3 py-1.5 text-sm font-semibold text-white ring-1 ring-white/25"
            >
              {c.name}
            </button>
          </li>
        ))}
      </ul>

      <AnimatePresence>{picked && <BirdCard key={picked} name={picked} at={at} onClose={() => setPicked(null)} />}</AnimatePresence>
    </section>
  )
}
