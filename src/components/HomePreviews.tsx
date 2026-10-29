import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { cases, services } from '@/content'
import { art } from '@/lib/paths'
import { ClientLogo } from './ClientLogo'
import { Reveal } from './Reveal'

const serviceArt: Record<string, string> = {
  launch: 'obj-megaphone.webp',
  clipping: 'obj-clapper.webp',
  podcast: 'obj-mic.webp',
  ugc: 'obj-phone.webp',
}

function SectionHead({ label, title, to, cta }: { label: string; title: string; to: string; cta: string }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-10">
      <Reveal>
        <p className="label-pill mb-4">{label}</p>
        <h2 className="display text-[clamp(2rem,4.4vw,3.8rem)]">{title}</h2>
      </Reveal>
      <Link
        to={to}
        className="group inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.95rem] font-semibold text-accent ring-1 ring-accent/30 transition-colors hover:bg-accent/10"
      >
        {cta}
        <ArrowRight size={16} aria-hidden className="transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  )
}

/** Four compact service tiles that link to the Services page. */
export function ServicesPreview() {
  return (
    <section aria-label="Services" className="bg-base pb-20 sm:pb-28">
      <div className="shell">
        <SectionHead label="Services" title="What we do" to="/services" cta="All services" />
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {services.map((s, i) => (
            <Reveal key={s.id} delay={i * 0.05}>
              <Link
                to="/services"
                className="group border-grad block h-full overflow-hidden rounded-3xl [--card:var(--base)] shadow-[0_24px_50px_-40px_rgb(20_30_120/0.6)]"
              >
                <div className="bg-brand grid aspect-[4/3] place-items-center">
                  <img
                    src={art(serviceArt[s.id])}
                    alt=""
                    loading="lazy"
                    className="h-[78%] w-auto object-contain drop-shadow-[0_18px_24px_rgb(10_10_60/0.45)] transition-transform duration-500 group-hover:scale-[1.07] group-hover:-rotate-3"
                  />
                </div>
                <div className="p-4 sm:p-5">
                  <h3 className="text-[1.05rem] font-semibold sm:text-lg">{s.title}</h3>
                  <p className="mt-1.5 line-clamp-2 text-sm text-muted">{s.short}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/** The three case studies as compact cards that link to the Work page. */
export function WorkPreview() {
  return (
    <section aria-label="Work" className="bg-base pb-20 sm:pb-28">
      <div className="shell">
        <SectionHead label="Work" title="Recent launches" to="/work" cta="See all work" />
        <div className="grid gap-4 md:grid-cols-3 sm:gap-5">
          {cases.map((c, i) => {
            const tone = ['bg-deep text-on-deep', 'bg-surface text-fg', 'bg-brand text-white'][i % 3]
            return (
              <Reveal key={c.client} delay={i * 0.06}>
                <Link
                  to="/work"
                  className={`group flex h-full flex-col justify-between gap-10 rounded-3xl p-6 transition-transform duration-300 hover:-translate-y-1 sm:p-7 ${tone}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex h-7 items-center">
                      <ClientLogo name={c.client} height={22} />
                    </span>
                    <span className="text-xs opacity-80">{c.tag}</span>
                  </div>
                  <div>
                    <p className="serif text-[clamp(3rem,6vw,4.6rem)] leading-[0.9]">{c.metrics[0].v}</p>
                    <p className="mt-2 text-sm opacity-85">{c.metrics[0].k}</p>
                    <p className="mt-5 text-[1.05rem] leading-snug font-medium">{c.title}</p>
                  </div>
                </Link>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
