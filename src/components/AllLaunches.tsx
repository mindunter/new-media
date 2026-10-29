import { motion } from 'motion/react'
import { useState } from 'react'
import { asOf, clients, launches, stats } from '@/content'
import { cn, compact } from '@/lib/utils'
import { DeviceWall } from './DeviceWall'
import { ClientLogo } from './ClientLogo'
import { Reveal } from './Reveal'

const brands = Array.from(new Set(launches.map((l) => l.brand)))
const max = Math.max(...launches.map((l) => l.views))
// The headline total comes from the exact post counts; summing the rounded rows lands slightly lower.
const totalLabel = `${stats[0].value}${stats[0].suffix}`

/** Every launch as a bar on one shared scale, filterable by brand. */
export function AllLaunches() {
  const [brand, setBrand] = useState<string | null>(null)
  const shown = brand ? launches.filter((l) => l.brand === brand) : launches
  const sum = shown.reduce((s, l) => s + l.views, 0)

  return (
    <section aria-labelledby="all-title" className="bg-base pb-20 sm:pb-28 lg:pb-32">
      <div className="shell">
        {/* Now playing: a wall of screens cycling through the launches. */}
        <Reveal>
          <div className="hero-sky relative mb-14 overflow-hidden rounded-[32px] px-2 pt-10 pb-2 sm:mb-20 sm:pt-14">
            <p className="label-pill label-pill-dark mx-auto mb-8 flex sm:mb-10">Now playing</p>
            <DeviceWall />
          </div>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-2 md:items-end md:gap-10">
          <Reveal>
            <h2 id="all-title" className="display text-[clamp(2rem,4vw,3.6rem)]">
              Every launch so far
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="text-sm text-muted md:justify-self-end md:text-right">
              Views on X as of {asOf}. Bars share one scale.
            </p>
          </Reveal>
        </div>

        <div
          className="-mx-4 mt-8 flex gap-1.5 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
          role="group"
          aria-label="Filter by brand"
        >
          {[null, ...brands].map((b) => (
            <button
              key={b ?? 'all'}
              type="button"
              aria-pressed={brand === b}
              onClick={() => setBrand(b)}
              className={cn(
                'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                brand === b ? 'bg-fg text-base' : 'bg-surface text-fg hover:bg-fg/10',
              )}
            >
              {b ?? 'All brands'}
            </button>
          ))}
        </div>

        <ol className="mt-6 border-t border-fg/10">
          {shown.map((l, i) => (
            <motion.li
              layout
              key={`${l.brand}-${l.title}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: i * 0.03 }}
              className="grid grid-cols-1 gap-2 border-b border-fg/10 py-4 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_5rem] sm:items-center sm:gap-6"
            >
              <div className="min-w-0">
                <p className="flex h-7 items-center">
                  <ClientLogo name={l.brand} height={20} />
                </p>
                <p className="truncate text-sm text-muted" title={l.title}>
                  {l.title}
                </p>
              </div>
              <div className="flex items-center gap-3 sm:block">
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-fg/[0.06]">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${Math.max(2, (l.views / max) * 100)}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.05 * i }}
                  />
                </div>
                <p className="serif text-lg sm:hidden">{compact(l.views)}</p>
              </div>
              <p className="serif hidden text-right text-xl sm:block">{compact(l.views)}</p>
            </motion.li>
          ))}
        </ol>

        <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4 text-sm text-muted">
          <span>Also launched:</span>
          {clients
            .filter((c) => !launches.some((l) => l.brand === c.name))
            .map((c) => (
              <span key={c.name} className="flex h-7 items-center text-fg/80">
                <ClientLogo name={c.name} height={20} />
              </span>
            ))}
          <span className="basis-full text-xs sm:basis-auto">Public numbers for these are not in the chart yet.</span>
        </div>
        <p className="mt-5 flex flex-wrap justify-between gap-2 text-sm text-muted">
          <span>
            {brand ? `${brand}: ${shown.length} launch${shown.length > 1 ? 'es' : ''}` : `${launches.length} launches`}
          </span>
          <span className="font-semibold text-fg">{brand ? compact(sum) : totalLabel} views</span>
        </p>
      </div>
    </section>
  )
}
