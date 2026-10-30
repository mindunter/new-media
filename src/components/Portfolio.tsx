import { Link } from 'react-router'
import { backers, portfolio, reasons } from '@/content'
import { ClientLogo } from './ClientLogo'
import { Reveal } from './Reveal'

/** The client wall: each company's logo with the result of its launch. */
export function Portfolio() {
  return (
    <section aria-labelledby="portfolio-title" className="bg-page pb-20 sm:pb-28">
      <div className="shell">
        <Reveal>
          <p className="label-pill mb-4">Clients</p>
          <h2 id="portfolio-title" className="display text-[clamp(2.2rem,5vw,4.4rem)]">
            Companies that launched with us
          </h2>
        </Reveal>

        <ul className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-fg/10 bg-fg/10 sm:mt-12 lg:grid-cols-5">
          {portfolio.map((c) => (
            <li key={c.name} className="bg-page">
              <Link
                to="/work"
                className="group flex h-full flex-col justify-between gap-8 p-5 transition-colors hover:bg-surface sm:p-6"
              >
                <span className="flex h-8 items-center text-fg transition-colors group-hover:text-accent">
                  <ClientLogo name={c.name} height={22} />
                </span>
                <span>
                  {c.stat && <span className="serif block text-3xl leading-none text-accent sm:text-4xl">{c.stat}</span>}
                  <span className="mt-1.5 block text-sm text-muted">{c.detail}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted">
          These companies are backed by investors including {backers.slice(0, -1).join(', ')} and{' '}
          {backers[backers.length - 1]}.
        </p>
      </div>
    </section>
  )
}

/** Why clients pick us: Trusted, Reliable, Affordable, Clean. */
export function Reasons() {
  return (
    <section aria-labelledby="reasons-title" className="bg-deep py-20 text-on-deep sm:py-28">
      <div className="shell">
        <Reveal>
          <h2 id="reasons-title" className="display text-[clamp(2.2rem,5vw,4.4rem)]">
            Why teams work with us
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-x-8 gap-y-10 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((r, i) => (
            <Reveal key={r.title} delay={i * 0.05}>
              <div className="border-t border-on-deep/20 pt-5">
                <h3 className="serif text-[clamp(1.9rem,3vw,2.6rem)] leading-none text-soft italic">{r.title}</h3>
                <p className="mt-4 text-[1.02rem] leading-relaxed text-on-deep/75">{r.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
