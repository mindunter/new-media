import { Link, useLocation } from 'react-router'
import { brand, cta, nav } from '@/content'
import { art } from '@/lib/paths'
import { Button } from './Button'
import { LogoFull } from './Logo'
import { Sky } from './Sky'

const YEAR = new Date().getFullYear()

/** The call to action at the end of every page except Contact, on the bold colour. */
function CtaBand() {
  return (
    <div className="relative isolate overflow-hidden text-white">
      <Sky scrim position="50% 62%" />
      <div className="shell grid items-center gap-8 py-16 sm:py-20 md:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <h2 className="display text-[clamp(2.4rem,6vw,5rem)] [text-shadow:0_2px_24px_rgb(5_40_120/0.3)]">
            Launching soon? <span className="serif italic">Book a call.</span>
          </h2>
          <p className="mt-4 w-fit max-w-lg text-[1.05rem] text-white [text-shadow:0_1px_12px_rgb(5_40_120/0.35)]">
            Tell us what you are shipping. We reply within one business day with a plan and a timeline.
          </p>
          <div className="mt-7">
            <Button href={cta.href} variant="light" size="lg">
              {cta.label}
            </Button>
          </div>
        </div>
        <img
          src={art('obj-tv.webp')}
          alt=""
          aria-hidden
          loading="lazy"
          className="hidden w-[min(30vw,360px)] md:block"
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
              <li>
                <Link to="/contact" className="text-on-deep/75 transition-colors hover:text-soft">
                  Contact
                </Link>
              </li>
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
