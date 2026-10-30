import { motion } from 'motion/react'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { asOf, cta, hero } from '@/content'
import { burst } from '@/lib/burst'
import { art } from '@/lib/paths'
import { prefersReducedMotion } from '@/lib/utils'
import { Button } from './Button'
import { DotField } from './DotField'

const HeroTV = lazy(() => import('../three/HeroTV'))
const ease = [0.16, 1, 0.3, 1] as const

/**
 * Loads the 3D TV only on larger screens with a mouse, once the stage is near
 * the viewport and the page is idle. Phones and reduced motion keep the still
 * render, which looks the same at that size and saves ~250KB of JavaScript.
 */
function use3D(stage: React.RefObject<HTMLElement | null>) {
  const [ok, setOk] = useState(false)
  useEffect(() => {
    const el = stage.current
    if (!el || prefersReducedMotion()) return
    if (!window.matchMedia('(min-width: 768px) and (pointer: fine)').matches) return
    let idle = 0
    const io = new IntersectionObserver(
      ([en]) => {
        if (!en.isIntersecting) return
        io.disconnect()
        // The page animates constantly, so idle time can be rare: cap the wait.
        if ('requestIdleCallback' in window) idle = window.requestIdleCallback(() => setOk(true), { timeout: 1500 })
        else globalThis.setTimeout(() => setOk(true), 800)
      },
      { rootMargin: '200px' },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      if (idle && 'cancelIdleCallback' in window) window.cancelIdleCallback(idle)
    }
  }, [stage])
  return ok
}

/** Hero: the promise, one action, and the proof, beside a live 3D TV playing real launches. */
export function Hero() {
  const stage = useRef<HTMLDivElement>(null)
  const load3d = use3D(stage)
  const [ready, setReady] = useState(false)

  return (
    <section
      id="top"
      className="relative isolate overflow-hidden bg-page"
      onPointerDown={(e) => {
        // Clicking empty space sets off a launch: logos and devices burst from the pointer.
        if ((e.target as HTMLElement).closest('a, button, canvas')) return
        burst(e.clientX, e.clientY, { count: 12 })
      }}
    >
      <DotField className="absolute inset-0 -z-10 h-full w-full [mask-image:radial-gradient(80%_80%_at_75%_40%,black_30%,transparent_85%)]" />

      <div className="shell grid items-center gap-6 pt-28 pb-10 sm:pt-32 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-10 lg:pt-36 lg:pb-16">
        <div>
          <motion.p
            className="label-pill mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
          >
            {hero.eyebrow}
          </motion.p>

          <h1 className="display text-[clamp(2.7rem,7.5vw,4.6rem)] lg:text-[clamp(3.6rem,4.9vw,5.2rem)]">
            {hero.lines.map((line, i) => {
              const last = i === hero.lines.length - 1
              return (
                <span key={line} className="block overflow-hidden pb-[0.12em] lg:whitespace-nowrap">
                  <motion.span
                    className={last ? 'serif inline-block pr-[0.08em] text-accent italic' : 'inline-block'}
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
            <p className="mt-5 max-w-[34rem] text-[1.05rem] leading-relaxed text-muted text-pretty sm:text-lg">
              {hero.sub}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button href={cta.href} variant="signal" size="lg" className="max-sm:flex-1">
                {cta.label}
              </Button>
              <Button href="/work" variant="outline" size="lg" arrow={false} className="max-sm:flex-1">
                {hero.secondary}
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted">
              <span className="font-semibold text-fg">{hero.proof}</span> As of {asOf}.
            </p>
          </motion.div>
        </div>

        {/* 3D TV stage: a still render shows until the live scene is ready. */}
        <motion.div
          ref={stage}
          className="relative mx-auto aspect-[4/3] w-full max-w-[600px]"
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.2, ease, delay: 0.3 }}
        >
          <img
            src={art('obj-tv.webp')}
            alt="A chrome retro TV showing Reactor's launch: 12.7M views"
            fetchPriority="high"
            className={`absolute inset-[6%] h-[88%] w-[88%] object-contain transition-opacity duration-700 ${ready ? 'opacity-0' : 'opacity-100'}`}
          />
          {load3d && (
            <Suspense fallback={null}>
              <div className={`absolute inset-0 transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}>
                <HeroTV onReady={() => setReady(true)} />
              </div>
            </Suspense>
          )}
        </motion.div>
      </div>
    </section>
  )
}
