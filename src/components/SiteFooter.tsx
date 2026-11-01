import { Link, useLocation } from 'react-router'
import { brand, nav } from '@/content'
import { BookingCalendar } from './BookingCalendar'
import { LogoFull } from './Logo'
import { Sky } from './Sky'

const YEAR = new Date().getFullYear()

/** The last section of every page except Contact: book a call right here, in a few clicks. */
function CtaBand() {
  return (
    <div id="book" className="relative isolate overflow-hidden text-white">
      <Sky scrim position="50% 62%" />
      <div className="shell grid items-center gap-10 py-16 sm:py-24 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-16">
        <div>
          <h2 className="display text-[clamp(2.4rem,6vw,5rem)] [text-shadow:0_2px_24px_rgb(5_40_120/0.3)]">
            Launching soon? <span className="serif italic">Book a call.</span>
          </h2>
          <p className="mt-4 max-w-lg text-[1.05rem] text-white [text-shadow:0_1px_12px_rgb(5_40_120/0.35)]">
            Pick a day and a time, add your email, and you are done. We take it from there.
          </p>
        </div>
        <BookingCalendar />
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
            <p className="mt-4 max-w-xs text-sm text-on-deep-muted">
              Creator distribution for AI and tech companies. Launches impossible to scroll past.
            </p>
          </div>
          <nav aria-label="Footer">
            <p className="mb-3 text-sm font-semibold text-on-deep-muted">Pages</p>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-on-deep transition-colors hover:text-soft">
                  Home
                </Link>
              </li>
              {nav.map((n) => (
                <li key={n.href}>
                  <Link to={n.href} className="text-on-deep transition-colors hover:text-soft">
                    {n.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/contact" className="text-on-deep transition-colors hover:text-soft">
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
          <div>
            <p className="mb-3 text-sm font-semibold text-on-deep-muted">Follow</p>
            <ul className="space-y-2">
              {brand.socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} className="text-on-deep transition-colors hover:text-soft">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-on-deep/10 pt-6 text-sm text-on-deep-muted">
          <p>© {YEAR} New Media. All rights reserved.</p>
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-on-deep">
            Back to top ↑
          </button>
        </div>
      </div>
    </footer>
  )
}
