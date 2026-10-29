import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react'
import { Plus } from 'lucide-react'
import { useRef, useState } from 'react'
import { services } from '@/content'
import { cn } from '@/lib/utils'
import { Reveal } from './Reveal'
import { ServiceVisual } from './ServiceVisuals'

export function Services() {
  const [hovered, setHovered] = useState<string | null>(null)
  const [open, setOpen] = useState<string | null>(services[0].id)
  const list = useRef<HTMLDivElement>(null)
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 24, mass: 0.6 })
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 24, mass: 0.6 })

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || !list.current) return
    const r = list.current.getBoundingClientRect()
    x.set(e.clientX - r.left)
    y.set(e.clientY - r.top)
  }


  return (
    <section id="services" aria-labelledby="services-title" className="relative bg-base pb-20 sm:pb-28 lg:pb-32">
      <div className="shell">
        <div className="mb-10 grid gap-5 sm:mb-14 md:grid-cols-2 md:items-end md:gap-10">
          <Reveal>
            <p className="label-pill mb-4">Services</p>
            <h2 id="services-title" className="display text-[clamp(2.2rem,5vw,4.8rem)]">
              What we do
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="max-w-md text-[1.05rem] leading-relaxed text-fg/70 sm:text-lg md:justify-self-end">
              Four services run by one team, so your launch, clips and podcast all tell the same story.
            </p>
          </Reveal>
        </div>

        <div
          ref={list}
          className="relative"
          onPointerMove={onMove}
          onPointerLeave={() => setHovered(null)}
        >
          <AnimatePresence>
            {hovered && (
              <motion.div
                key="preview"
                aria-hidden
                className="pointer-events-none absolute top-0 left-0 z-20 hidden h-56 w-80 overflow-hidden rounded-2xl bg-deep shadow-2xl lg:block"
                style={{ x, y, translateX: '-50%', translateY: '-115%' }}
                initial={{ opacity: 0, scale: 0.6, rotate: -6 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.6, rotate: 6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={hovered}
                    className="h-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ServiceVisual id={hovered} />
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          <ul className="border-t border-fg/15">
            {services.map((s) => {
              const isOpen = open === s.id
              const dim = hovered && hovered !== s.id
              return (
                <li key={s.id} className="border-b border-fg/15" onPointerEnter={() => setHovered(s.id)}>
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`svc-${s.id}`}
                      onClick={() => setOpen(isOpen ? null : s.id)}
                      className={cn(
                        'group flex w-full items-center justify-between gap-4 py-6 text-left transition-opacity duration-500 sm:py-8',
                        dim && 'lg:opacity-30',
                      )}
                    >
                      <span className="display block text-[clamp(1.9rem,4.6vw,4.4rem)] transition-transform duration-500 ease-[var(--ease-out-expo)] lg:group-hover:translate-x-4">
                        {s.title}
                      </span>
                      <span
                        className={cn(
                          'grid h-11 w-11 place-items-center rounded-full border border-fg/20 transition-all duration-500 ease-[var(--ease-out-expo)] sm:h-14 sm:w-14',
                          isOpen ? 'rotate-45 border-fill bg-fill text-white' : 'group-hover:border-fg group-hover:bg-fg group-hover:text-base',
                        )}
                      >
                        <Plus size={20} aria-hidden />
                      </span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`svc-${s.id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="grid gap-5 pb-8 sm:pb-10 md:grid-cols-2 md:gap-10">
                          <p className="max-w-lg text-lg leading-relaxed text-fg/75">{s.short}</p>
                          <ul className="flex flex-wrap content-start gap-2">
                            {s.points.map((p) => (
                              <li key={p} className="rounded-full border border-fg/15 px-4 py-2 text-sm">
                                {p}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
