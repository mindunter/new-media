import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef } from 'react'
import { engine } from '@/content'
import { getLenis } from '@/lib/scroll'

gsap.registerPlugin(useGSAP, ScrollTrigger)

/** Attention over time: flat before launch, spike at hour zero, long sustained tail. */
const CURVE =
  'M0 300 C 300 300, 520 296, 760 290 S 1180 270, 1420 250 S 1700 40, 1820 30 S 2000 120, 2200 150 S 2700 140, 3000 120'

export function Engine() {
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const path = useRef<SVGPathElement>(null)

  // Keep ScrollTrigger in step with Lenis, and re-measure once this chunk and the fonts are in.
  useEffect(() => {
    const lenis = getLenis()
    lenis?.on('scroll', ScrollTrigger.update)
    ScrollTrigger.refresh()
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    return () => lenis?.off('scroll', ScrollTrigger.update)
  }, [])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        const el = track.current!
        const p = path.current!
        const len = p.getTotalLength()
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len })

        const distance = () => el.scrollWidth - window.innerWidth
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        })
        tl.to(el, { x: () => -distance(), ease: 'none' }, 0)
        tl.to(p, { strokeDashoffset: 0, ease: 'none' }, 0)

        gsap.utils.toArray<HTMLElement>('[data-panel]', el).forEach((panel) => {
          gsap.from(panel.querySelectorAll('[data-in]'), {
            y: 60,
            opacity: 0,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: panel,
              containerAnimation: tl,
              start: 'left 75%',
              end: 'left 35%',
              scrub: true,
            },
          })
        })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      id="engine"
      aria-labelledby="engine-title"
      className="relative overflow-hidden bg-deep bg-[radial-gradient(50%_60%_at_0%_0%,rgb(47_84_235/0.35),transparent_70%),radial-gradient(45%_55%_at_100%_100%,rgb(122_59_237/0.3),transparent_70%)] text-on-deep lg:h-screen"
    >
      <div
        ref={track}
        className="shell relative flex flex-col gap-12 py-20 sm:py-28 md:grid md:grid-cols-2 md:gap-x-10 md:gap-y-14 lg:flex lg:h-full lg:w-max lg:max-w-none lg:flex-row lg:items-stretch lg:gap-0 lg:p-0"
      >
        <svg
          aria-hidden
          viewBox="0 0 3000 340"
          preserveAspectRatio="none"
          className="pointer-events-none absolute right-0 bottom-[12vh] left-0 hidden h-[34vh] w-full lg:block"
        >
          <defs>
            <linearGradient id="curve-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#1668e8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#1668e8" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${CURVE} L 3000 340 L 0 340 Z`} fill="url(#curve-fill)" opacity="0.5" />
          <path ref={path} d={CURVE} fill="none" stroke="#a9d3ff" strokeWidth="3" vectorEffect="non-scaling-stroke" />
        </svg>

        <div className="flex shrink-0 flex-col justify-center md:col-span-2 lg:w-[44vw] lg:pr-[4vw] lg:pl-[max(48px,calc((100vw-1360px)/2+48px))]">
          <p className="label-pill label-pill-dark mb-4">Process</p>
          <h2 id="engine-title" className="display text-[clamp(2.4rem,5.6vw,5.6rem)]">
            How a launch runs
          </h2>
          <p className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-on-deep/70 sm:text-lg">
            Attention builds over a month: quiet weeks before launch, a spike in launch hour, then a long tail. We plan
            all of it, from the first brief to the final report.
          </p>
          <p className="mt-10 hidden items-center gap-3 text-sm text-on-deep-muted lg:flex">
            Scroll to follow the timeline <span className="inline-block h-px w-16 bg-page/30" />
          </p>
        </div>

        {engine.map((step) => (
          <article
            key={step.n}
            data-panel
            className="relative flex shrink-0 flex-col border-t border-on-deep/15 pt-6 lg:w-[32vw] lg:min-w-[400px] lg:border-t-0 lg:border-l lg:border-on-deep/10 lg:px-[3vw] lg:pt-[20vh]"
          >
            <div data-in className="flex items-baseline gap-3 text-sm font-semibold">
              <span className="text-soft">Step {Number(step.n)}</span>
              <span className="text-on-deep-muted">{step.meta}</span>
            </div>
            <h3 data-in className="display mt-4 text-[clamp(2.2rem,4vw,4rem)]">
              {step.title}
            </h3>
            <p data-in className="mt-4 max-w-sm text-[1.05rem] leading-relaxed text-on-deep/70 sm:text-lg">
              {step.body}
            </p>
          </article>
        ))}

        <div className="hidden shrink-0 lg:block lg:w-[12vw]" />
      </div>
    </section>
  )
}
