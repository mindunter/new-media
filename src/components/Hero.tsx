import { motion, useScroll, useTransform } from 'motion/react'
import { MousePointerClick } from 'lucide-react'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { asOf, hero } from '@/content'
import { burst } from '@/lib/burst'
import { prefersReducedMotion } from '@/lib/utils'
import { Button } from './Button'
import { art } from '@/lib/paths'
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

/**
 * Hero: a rendered cloud sky (light and dark versions), a centred headline
 * with a chrome serif line, and a live 3D chrome TV that plays our launches.
 * A still render of the same TV shows until the 3D scene is ready.
 */
export function Hero() {
  const section = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '6%'])
  const skyY = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const stage = useRef<HTMLDivElement>(null)
  const load3d = use3D(stage)
  const [ready, setReady] = useState(false)

  return (
    <section
      ref={section}
      id="top"
      className="relative isolate overflow-hidden text-white"
      onPointerDown={(e) => {
        // Clicking empty space sets off a launch: logos and devices burst from the pointer.
        if ((e.target as HTMLElement).closest('a, button, canvas')) return
        burst(e.clientX, e.clientY, { count: 12 })
      }}
    >
      {/* Rendered sky: light and dark versions, with a slow parallax. */}
      <motion.div aria-hidden style={{ y: skyY }} className="absolute inset-0 -z-20">
        <img
          src={art("sky-light.webp")}
          srcSet={`${art("sky-light-1000.webp")} 1000w, ${art("sky-light.webp")} 2000w`}
          sizes="100vw"
          alt=""
          className="h-full w-full object-cover object-bottom dark:hidden"
          fetchPriority="high"
        />
        <img
          src={art("sky-dark.webp")}
          srcSet={`${art("sky-dark-1000.webp")} 1000w, ${art("sky-dark.webp")} 2000w`}
          sizes="100vw"
          alt=""
          className="hidden h-full w-full object-cover object-bottom dark:block"
        />
      </motion.div>
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-[22%] bg-gradient-to-b from-transparent to-base" />
      <DotField
        onDeep
        className="absolute inset-0 -z-10 h-full w-full opacity-60 [mask-image:linear-gradient(to_bottom,black_0%,black_45%,transparent_70%)]"
      />

      <motion.div style={{ y }} className="shell flex flex-col items-center pt-32 text-center sm:pt-36 lg:pt-40">
        <motion.p
          className="inline-flex items-center gap-2 rounded-full bg-white/14 px-3.5 py-1.5 text-[0.8rem] font-medium ring-1 ring-white/30 backdrop-blur-md sm:text-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.1 }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden />
          {hero.eyebrow}
        </motion.p>

        <h1 className="display mt-6 max-w-[16ch] text-[clamp(2.7rem,8vw,6.4rem)] [text-shadow:0_2px_30px_rgb(10_20_90/0.25)] sm:mt-8">
          {hero.lines.map((line, i) => {
            const last = i === hero.lines.length - 1
            return (
              <span key={line} className="block overflow-hidden pb-[0.12em]">
                <motion.span
                  className={last ? 'serif chrome inline-block pr-[0.08em] italic' : 'inline-block'}
                  initial={{ y: '105%' }}
                  animate={{ y: '0%' }}
                  transition={{ duration: 1.1, ease, delay: 0.15 + i * 0.09 }}
                >
                  {line}
                </motion.span>
              </span>
            )
          })}
        </h1>

        <motion.div
          className="mt-5 flex w-full flex-col items-center gap-6 sm:mt-7"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease, delay: 0.55 }}
        >
          <p className="max-w-[36rem] text-[1.05rem] leading-relaxed text-white/90 text-pretty sm:text-lg">
            {hero.sub}
          </p>
          <div className="flex w-full flex-wrap justify-center gap-3">
            <Button href="/contact" variant="light" size="lg" burst className="max-sm:flex-1">
              {hero.primary}
            </Button>
            <Button
              href="/work"
              variant="outlineDark"
              size="lg"
              arrow={false}
              className="bg-white/10 backdrop-blur-md max-sm:flex-1"
            >
              {hero.secondary}
            </Button>
          </div>
        </motion.div>

        {/* 3D TV stage */}
        <motion.div
          ref={stage}
          className="relative mt-6 aspect-[4/3] w-full max-w-[640px] sm:mt-4"
          initial={{ opacity: 0, y: 50, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.3, ease, delay: 0.65 }}
        >
          <img
            src={art("obj-tv.webp")}
            alt="A chrome retro TV showing Reactor's launch: 12.7M views"
            className={`absolute inset-[6%] h-[88%] w-[88%] object-contain drop-shadow-[0_30px_40px_rgb(20_30_120/0.35)] transition-opacity duration-700 ${ready ? 'opacity-0' : 'opacity-100'}`}
          />
          {load3d && (
            <Suspense fallback={null}>
              <div className={`absolute inset-0 transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}>
                <HeroTV onReady={() => setReady(true)} />
              </div>
            </Suspense>
          )}
        </motion.div>

        <motion.div
          className="-mt-2 mb-12 flex flex-col items-center gap-3 sm:mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-2xl bg-deep/60 px-4 py-2 text-sm text-white/85 ring-1 ring-white/15 backdrop-blur-md">
            <span className="font-semibold text-white">{hero.proof}</span>
            <span>As of {asOf}</span>
          </p>
          <p className="flex items-center gap-2 text-sm text-muted motion-reduce:hidden">
            <MousePointerClick size={16} aria-hidden className="text-accent" />
            <span className="[@media(pointer:coarse)]:hidden">Click the TV to change the channel. Click the sky to launch.</span>
            <span className="[@media(pointer:fine)]:hidden">Tap the TV to change the channel. Tap the sky to launch.</span>
          </p>
        </motion.div>
      </motion.div>
    </section>
  )
}
