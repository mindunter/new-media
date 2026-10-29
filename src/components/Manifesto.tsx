import { motion } from 'motion/react'
import { thesis } from '@/content'
import { burstFrom } from '@/lib/burst'

// Marker colours for the highlighted phrases, all inside the blue/violet brand range.
const chipColors = ['#2f54eb', '#7a3bed', '#2f8cff', '#4b3ff0', '#6a2fd8', '#2563eb']

function Chip({ children, i }: { children: string; i: number }) {
  return (
    <motion.button
      type="button"
      onClick={(e) => burstFrom(e.currentTarget, { count: 10 })}
      className="serif relative mx-[0.12em] my-[0.08em] inline-block cursor-pointer rounded-[0.18em] px-[0.28em] pb-[0.06em] align-baseline leading-[1.15] font-normal text-white italic"
      style={{ background: chipColors[i % chipColors.length], rotate: i % 2 ? 0.8 : -0.8 }}
      initial={{ clipPath: 'inset(0 100% 0 0 round 0.18em)' }}
      whileInView={{ clipPath: 'inset(0 0% 0 0 round 0.18em)' }}
      viewport={{ once: true, margin: '0px 0px -15% 0px' }}
      transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1], delay: 0.1 + i * 0.12 }}
      whileHover={{ rotate: i % 2 ? -1.5 : 1.5, scale: 1.04 }}
    >
      {children}
    </motion.button>
  )
}

/** Positioning card with highlighted phrases, in the style of a printed one-pager. */
export function Manifesto() {
  let n = 0
  return (
    <section aria-label="Who we are" className="mesh py-20 sm:py-28 lg:py-32">
      <div className="shell">
        <div className="border-grad mx-auto max-w-5xl rounded-[28px] px-6 py-10 text-center [--card:var(--base)] shadow-[0_40px_80px_-50px_rgb(20_30_120/0.45)] sm:px-12 sm:py-16">
          <p className="display text-[clamp(1.7rem,3.6vw,3.2rem)] leading-[1.12]">{thesis.lead}</p>
          {thesis.rows.map((row) => (
            <p key={row.text} className="display mt-4 text-[clamp(1.5rem,3.2vw,2.8rem)] leading-[1.25] text-fg/90 sm:mt-6">
              {row.text}{' '}
              {row.chips.map((c, k) => (
                <span key={c}>
                  <Chip i={n++}>{c}</Chip>
                  {k < row.chips.length - 2 ? ' ' : k === row.chips.length - 2 ? ' and ' : ''}
                </span>
              ))}
            </p>
          ))}
          <p className="display mt-4 text-[clamp(1.5rem,3.2vw,2.8rem)] leading-[1.25] text-muted sm:mt-6">{thesis.close}</p>
        </div>
      </div>
    </section>
  )
}
