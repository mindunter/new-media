import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { faqs } from '@/content'
import { cn } from '@/lib/utils'
import { Reveal } from './Reveal'

export function Faq() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" aria-labelledby="faq-title" className="bg-page py-20 sm:py-28 lg:py-32">
      <div className="shell grid gap-8 sm:gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <Reveal>
          <div className="lg:sticky lg:top-28">
            <p className="label-pill mb-4">FAQ</p>
            <h2 id="faq-title" className="display text-[clamp(2.2rem,5vw,4.8rem)]">
              Questions
            </h2>
            <p className="mt-5 max-w-sm text-[1.05rem] leading-relaxed text-fg/70 sm:text-lg">
              Anything else, email us and we'll reply within a day.
            </p>
          </div>
        </Reveal>

        <ul className="border-t border-fg/15">
          {faqs.map((f, i) => {
            const isOpen = open === i
            return (
              <li key={f.q} className="border-b border-fg/15">
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="group flex w-full items-center justify-between gap-6 py-6 text-left sm:py-7"
                  >
                    <span className="text-lg font-semibold transition-colors group-hover:text-accent sm:text-xl">
                      {f.q}
                    </span>
                    <span aria-hidden className="relative h-4 w-4 shrink-0">
                      <span className="absolute top-1/2 left-0 h-[2px] w-4 -translate-y-1/2 bg-current" />
                      <span
                        className={cn(
                          'absolute top-0 left-1/2 h-4 w-[2px] -translate-x-1/2 bg-current transition-transform duration-500 ease-[var(--ease-out-expo)]',
                          isOpen && 'scale-y-0',
                        )}
                      />
                    </span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-2xl pb-6 text-[1.05rem] leading-relaxed text-fg/70 sm:text-lg">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
