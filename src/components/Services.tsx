import { motion, useMotionValue, useSpring } from 'motion/react'
import { Check } from 'lucide-react'
import { services } from '@/content'
import { burstFrom } from '@/lib/burst'
import { Reveal } from './Reveal'

const art: Record<string, { src: string; alt: string }> = {
  launch: { src: './art/obj-megaphone.webp', alt: 'Chrome megaphone' },
  clipping: { src: './art/obj-clapper.webp', alt: 'Chrome clapperboard' },
  podcast: { src: './art/obj-mic.webp', alt: 'Chrome studio microphone' },
  ugc: { src: './art/obj-phone.webp', alt: 'Glass phone playing a video' },
}

/** Service card: a 3D chrome render on a brand gradient that tilts toward the cursor. */
function ServiceCard({ s, i }: { s: (typeof services)[number]; i: number }) {
  const rx = useSpring(useMotionValue(0), { stiffness: 150, damping: 18 })
  const ry = useSpring(useMotionValue(0), { stiffness: 150, damping: 18 })
  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 16)
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 12)
  }
  const reset = () => {
    rx.set(0)
    ry.set(0)
  }
  const a = art[s.id]

  return (
    <Reveal delay={i * 0.06} className="h-full">
      <article
        onPointerMove={onMove}
        onPointerLeave={reset}
        className="group border-grad flex h-full flex-col overflow-hidden rounded-[28px] [--card:var(--base)] shadow-[0_30px_60px_-40px_rgb(20_30_120/0.5)]"
      >
        <button
          type="button"
          aria-label={`${s.title}: set off a launch`}
          onClick={(e) => burstFrom(e.currentTarget, { count: 12 })}
          className="bg-brand relative grid aspect-[16/10] cursor-pointer place-items-center overflow-hidden [perspective:900px]"
        >
          <span
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_45%,rgb(255_255_255/0.28),transparent_70%)]"
          />
          <motion.img
            src={a.src}
            alt={a.alt}
            loading="lazy"
            style={{ rotateX: rx, rotateY: ry }}
            className="relative h-[86%] w-auto object-contain drop-shadow-[0_24px_30px_rgb(10_10_60/0.45)] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.06]"
          />
        </button>
        <div className="flex flex-1 flex-col p-6 sm:p-8">
          <h3 className="display text-[clamp(1.6rem,2.6vw,2.2rem)]">{s.title}</h3>
          <p className="mt-3 text-[1.02rem] leading-relaxed text-muted">{s.short}</p>
          <ul className="mt-6 grid gap-2.5">
            {s.points.map((p) => (
              <li key={p} className="flex items-center gap-2.5 text-[0.95rem]">
                <span className="bg-grad grid h-5 w-5 shrink-0 place-items-center rounded-full text-white">
                  <Check size={12} strokeWidth={3} aria-hidden />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </article>
    </Reveal>
  )
}

export function Services() {
  return (
    <section id="services" aria-labelledby="services-title" className="bg-base py-20 sm:py-28 lg:py-32">
      <div className="shell">
        <div className="mb-10 grid gap-5 sm:mb-14 md:grid-cols-2 md:items-end md:gap-10">
          <Reveal>
            <p className="label-pill mb-4">Services</p>
            <h2 id="services-title" className="display text-[clamp(2.2rem,5vw,4.8rem)]">
              What we do
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="max-w-md text-[1.05rem] leading-relaxed text-muted sm:text-lg md:justify-self-end">
              Four services run by one team, so your launch, clips and podcast all tell the same story.
            </p>
          </Reveal>
        </div>
        <div className="grid gap-5 sm:gap-6 md:grid-cols-2">
          {services.map((s, i) => (
            <ServiceCard key={s.id} s={s} i={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
