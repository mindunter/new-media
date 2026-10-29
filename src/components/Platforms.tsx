import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react'
import { useRef } from 'react'
import { burstFrom } from '@/lib/burst'
import { devices, PlatformIcon, platforms } from '@/lib/icons'
import { Reveal } from './Reveal'

// Deterministic scatter so the layout is the same on every visit.
const scatter = (i: number) => {
  const a = Math.sin(i * 12.9898) * 43758.5453
  const b = Math.sin(i * 78.233) * 12543.1234
  const fa = a - Math.floor(a)
  const fb = b - Math.floor(b)
  return { x: (fa - 0.5) * 70, y: (fb - 0.5) * 50 + 20, r: (fa - 0.5) * 120 }
}

/** A tile that flies in from a scattered spot as the section scrolls into place. */
function Tile({
  i,
  progress,
  children,
  onPress,
  label,
  className,
}: {
  i: number
  progress: MotionValue<number>
  children: React.ReactNode
  onPress: (el: HTMLElement) => void
  label: string
  className: string
}) {
  const s = scatter(i + 1)
  const reduced = useReducedMotion()
  const x = useTransform(progress, [0, 1], [`${s.x}vw`, '0vw'])
  const y = useTransform(progress, [0, 1], [`${s.y}vh`, '0vh'])
  const rotate = useTransform(progress, [0, 1], [s.r, 0])
  const scale = useTransform(progress, [0, 1], [0.5, 1])
  const opacity = useTransform(progress, [0, 0.3, 1], [0, 1, 1])

  return (
    <motion.button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => onPress(e.currentTarget)}
      style={reduced ? undefined : { x, y, rotate, scale, opacity }}
      whileHover={{ y: -6, scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      className={className}
    >
      {children}
    </motion.button>
  )
}

/**
 * "Where your launch shows up": platform logos and media devices that start
 * scattered and snap into a grid as you scroll. Tapping any tile sets it off.
 */
export function Platforms() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center 60%'] })
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 22 })

  const tile =
    'group grid aspect-square place-items-center rounded-[26%] border border-fg/10 bg-surface shadow-[0_10px_30px_-14px_rgb(10_10_40/0.35)] transition-colors hover:border-accent/50'

  return (
    <section aria-labelledby="platforms-title" className="overflow-hidden bg-base py-20 sm:py-28 lg:py-32">
      <div className="shell">
        <div className="grid gap-5 md:grid-cols-2 md:items-end md:gap-10">
          <Reveal>
            <p className="label-pill mb-4">Channels</p>
            <h2 id="platforms-title" className="display text-[clamp(2.2rem,5vw,4.8rem)]">
              Everywhere your buyers <span className="serif text-gradient pr-[0.08em] italic">scroll</span>
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="max-w-md text-[1.05rem] leading-relaxed text-muted sm:text-lg md:justify-self-end">
              Launch posts on X and LinkedIn, clips on Shorts, Reels and TikTok, episodes on Spotify and Apple
              Podcasts. Tap any tile.
            </p>
          </Reveal>
        </div>

        <div ref={ref} className="mt-12 sm:mt-16">
          <div className="grid grid-cols-4 gap-3 sm:gap-5 md:grid-cols-8">
            {platforms.map((p, i) => (
              <Tile
                key={p.id}
                i={i}
                progress={progress}
                label={p.name}
                onPress={(el) => burstFrom(el, { count: 14, only: [p.id, p.id, 'phone', 'laptop'] })}
                className={tile}
              >
                <span className="h-[42%] w-[42%] text-fg transition-transform duration-300 group-hover:rotate-[-8deg] [&>svg]:h-full [&>svg]:w-full">
                  <PlatformIcon p={p} />
                </span>
              </Tile>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-5 gap-3 sm:mt-5 sm:gap-5 md:grid-cols-10">
            {devices.map((d, i) => (
              <Tile
                key={d.id}
                i={i + 20}
                progress={progress}
                label={d.name}
                onPress={(el) => burstFrom(el, { count: 12, only: devices.map((x) => x.id) })}
                className={`${tile} rounded-[30%] bg-base`}
              >
                <span
                  className={`h-[40%] w-[40%] transition-transform duration-300 group-hover:scale-110 [&>svg]:h-full [&>svg]:w-full ${i % 2 ? 'text-accent-2' : 'text-accent'}`}
                >
                  {d.icon}
                </span>
              </Tile>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
