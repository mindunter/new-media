import { Link, useLocation } from 'react-router'
import { brand, nav } from '@/content'
import { art } from '@/lib/paths'
import { Button } from './Button'
import { DotField } from './DotField'
import { LogoFull } from './Logo'

const YEAR = new Date().getFullYear()

/** Short call to action shown at the end of every page except Contact. */
function CtaBand() {
  return (
    <div className="relative isolate overflow-hidden border-b border-on-deep/10">
      <img
        src={art('sky-dark.webp')}
        alt=""
        aria-hidden
        loading="lazy"
        className="absolute inset-0 -z-20 h-full w-full object-cover object-bottom opacity-70"
      />
      <DotField onDeep className="absolute inset-0 -z-10 h-full w-full opacity-50" />
      <div className="shell grid items-center gap-8 py-16 sm:py-20 md:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <p className="mb-4 flex items-center gap-2.5 text-[0.95rem] font-medium text-on-deep/75">
            <span className="live-dot" aria-hidden /> Booking launches for next quarter
          </p>
          <h2 className="display text-[clamp(2.4rem,6vw,5rem)]">
            Ready to launch <span className="serif text-soft italic">loud?</span>
          </h2>
          <p className="mt-4 max-w-lg text-[1.05rem] text-on-deep/75">
            Tell us what you're shipping. We reply within one business day with a plan, a creator shortlist and a
            timeline.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button href="/contact" variant="light" size="lg" burst>
              Plan your launch
            </Button>
            <Button href="/work" variant="outlineDark" size="lg" arrow={false}>
              See our work
            </Button>
          </div>
        </div>
        <img
          src={art('obj-tv.webp')}
          alt=""
          aria-hidden
          loading="lazy"
          className="hidden w-[min(34vw,420px)] animate-[floaty_7s_ease-in-out_infinite] drop-shadow-[0_40px_50px_rgb(0_0_0/0.45)] md:block"
        />
      </div>
    </div>
  )
}

/** Site footer, with the CTA band above it on every page but Contact. */
export function SiteFooter() {
  const { pathname } = useLocation()
  const onContact = pathname.replace(/\/$/, '').endsWith('/contact')

  return (
    <footer className="bg-deep text-on-deep">
      {!onContact && <CtaBand />}
      <div className="shell pt-14 pb-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-[1fr_auto_auto] md:gap-20">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" aria-label="New Media home" className="inline-block">
              <LogoFull className="h-auto w-36 text-on-deep" />
            </Link>
            <p className="mt-4 max-w-xs text-sm text-on-deep/60">
              Creator distribution for AI and tech companies. Launches impossible to scroll past.
            </p>
          </div>
          <nav aria-label="Footer">
            <p className="mb-3 text-sm font-semibold text-on-deep/60">Pages</p>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-on-deep/75 transition-colors hover:text-soft">
                  Home
                </Link>
              </li>
              {nav.map((n) => (
                <li key={n.href}>
                  <Link to={n.href} className="text-on-deep/75 transition-colors hover:text-soft">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="mb-3 text-sm font-semibold text-on-deep/60">Follow</p>
            <ul className="space-y-2">
              {brand.socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} className="text-on-deep/75 transition-colors hover:text-soft">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-on-deep/10 pt-6 text-sm text-on-deep/60">
          <p>© {YEAR} New Media. All rights reserved.</p>
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-on-deep">
            Back to top ↑
          </button>
        </div>
      </div>
    </footer>
  )
}
