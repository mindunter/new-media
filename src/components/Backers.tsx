import { ArrowUpRight } from 'lucide-react'
import { asOf, backing, cta, firmCount, fundingTotal } from '@/content'
import { Button } from './Button'
import { ClientLogo } from './ClientLogo'
import { Reveal } from './Reveal'

/** Who invests in the companies we launched. Worded as backers of those companies, not of New Media. */
export function Backers() {
  return (
    <section aria-labelledby="backers-title" className="bg-deep py-20 text-on-deep sm:py-28">
      <div className="shell grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,8fr)] lg:gap-16">
        <Reveal>
          <p className="label-pill label-pill-dark mb-4">Trust</p>
          <h2 id="backers-title" className="display text-[clamp(2.2rem,3.7vw,3.5rem)]">
            The companies we launch are backed by <span className="serif italic">the best.</span>
          </h2>
          <div className="mt-8 flex gap-10">
            <p>
              <span className="serif block text-[clamp(2.6rem,5vw,4rem)] leading-none text-soft">{firmCount}</span>
              <span className="mt-1 block text-sm text-on-deep-muted">venture firms</span>
            </p>
            <p>
              <span className="serif block text-[clamp(2.6rem,5vw,4rem)] leading-none text-soft">${fundingTotal}M</span>
              <span className="mt-1 block text-sm text-on-deep-muted">raised in these rounds</span>
            </p>
          </div>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-on-deep-muted">
            These firms invest in our clients, not in New Media. Rounds are from each company's announcement or press coverage, as of {asOf}.
          </p>
          <Button href={cta.href} variant="light" size="lg" className="mt-7">
            {cta.label}
          </Button>
        </Reveal>

        <ul className="border-t border-on-deep/15">
          {backing.map((b, i) => (
            <Reveal key={b.client} delay={i * 0.04}>
              <li className="group grid gap-3 border-b border-on-deep/15 py-5 transition-colors hover:bg-on-deep/[0.04] sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-6 sm:px-3">
                <div>
                  <span className="flex h-7 items-center">
                    <ClientLogo name={b.client} height={22} />
                  </span>
                  <a href={b.source} target="_blank" rel="noreferrer" className="mt-1.5 inline-flex items-center gap-0.5 text-sm whitespace-nowrap text-on-deep-muted underline-offset-4 hover:text-soft hover:underline">
                    {b.raise} <ArrowUpRight size={13} aria-hidden />
                  </a>
                </div>
                <ul className="flex flex-wrap content-center gap-2">
                  {b.firms.map((f, k) => (
                    <li
                      key={f}
                      className={`serif rounded-full px-3.5 py-1 text-[1.05rem] ring-1 ring-inset transition-colors group-hover:ring-soft/60 ${k === 0 ? 'bg-on-deep text-deep ring-on-deep' : 'text-on-deep ring-on-deep/25'}`}
                    >
                      {f}
                    </li>
                  ))}
                </ul>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
