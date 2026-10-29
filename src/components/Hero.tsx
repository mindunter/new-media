import { motion, useScroll, useTransform } from 'motion/react'
import { MousePointerClick } from 'lucide-react'
import { useRef } from 'react'
import { asOf, hero } from '@/content'
import { burst } from '@/lib/burst'
import { Button } from './Button'
import { DeviceWall } from './DeviceWall'
import { DotField } from './DotField'

const ease = [0.16, 1, 0.3, 1] as const

/**
 * Sky-gradient hero: centred headline with a chrome serif line, a wall of
 * devices playing real launches, and a dot field that reacts to the pointer.
 * The gradient fades into the page colour at the bottom in both themes.
 */
export function Hero() {
  const section = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '5%'])

  return (
    <section
      ref={section}
      id="top"
      className="hero-sky relative isolate overflow-hidden text-white"
      onPointerDown={(e) => {
        // Clicking empty space sets off a launch: logos and devices burst from the pointer.
        if ((e.target as HTMLElement).closest('a, button')) return
        burst(e.clientX, e.clientY, { count: 12 })
      }}
    >
      <DotField
        onDeep
        className="absolute inset-0 -z-10 h-full w-full [mask-image:linear-gradient(to_bottom,black_0%,black_50%,transparent_78%)]"
      />
      {/* Glow behind the headline and soft clouds near the fade. */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-[6%] left-1/2 -z-10 h-[50%] w-[90%] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(190_205_255/0.5),transparent)] blur-2xl"
      />
      <div aria-hidden className="hero-clouds pointer-events-none absolute inset-x-0 bottom-[6%] -z-10 h-[40%]" />

      <motion.div style={{ y }} className="shell flex flex-col items-center pt-32 text-center sm:pt-36 lg:pt-40">
        <motion.p
          className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3.5 py-1.5 text-[0.8rem] font-medium text-white ring-1 ring-white/30 backdrop-blur-md sm:text-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.1 }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden />
          {hero.eyebrow}
        </motion.p>

        <h1 className="display mt-6 max-w-[16ch] text-[clamp(2.7rem,8.2vw,7.4rem)] sm:mt-8">
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
          className="mt-5 flex w-full flex-col items-center gap-7 sm:mt-7"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease, delay: 0.55 }}
        >
          <p className="max-w-[36rem] text-[1.05rem] leading-relaxed text-white/85 text-pretty sm:text-lg">{hero.sub}</p>
          <div className="flex w-full flex-wrap justify-center gap-3">
            <Button href="#contact" variant="light" size="lg" burst className="max-sm:flex-1">
              {hero.primary}
            </Button>
            <Button
              href="#launches"
              variant="outlineDark"
              size="lg"
              arrow={false}
              className="bg-white/10 backdrop-blur-md max-sm:flex-1"
            >
              {hero.secondary}
            </Button>
          </div>
          <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-2xl bg-[#0a0d24]/30 px-4 py-2 text-sm text-white/85 ring-1 ring-white/20 backdrop-blur-md">
            <span className="font-semibold text-white">{hero.proof}</span>
            <span>As of {asOf}</span>
          </p>
        </motion.div>

        <motion.div
          className="mt-14 w-full sm:mt-16"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease, delay: 0.7 }}
        >
          <DeviceWall />
          <p className="mt-6 mb-10 flex items-center justify-center gap-2 text-sm text-muted motion-reduce:hidden sm:mb-14">
            <MousePointerClick size={16} aria-hidden className="text-accent" />
            <span className="[@media(pointer:coarse)]:hidden">
              Click anywhere up here, or on a screen, to set off a launch.
            </span>
            <span className="[@media(pointer:fine)]:hidden">Tap anywhere up here, or a screen, to set off a launch.</span>
          </p>
        </motion.div>
      </motion.div>
    </section>
  )
}
