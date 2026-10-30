import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { brand, cta } from '@/content'
import { Button } from './Button'
import { ClientLogo } from './ClientLogo'
import { Sky } from './Sky'

const steps = ['Tell us what you are shipping', 'Get a plan and a creator shortlist', 'Launch on a clear timeline']
const proof = ['Reactor', 'Sazabi', 'Runlayer', 'BackOps', 'Beacon']

/** Contact page lead: one action, what happens next, and the proof. */
export function BookCall() {
  const [copied, setCopied] = useState(false)
  // Goes to the booking tool once brand.bookingLink is set; until then it opens an email.
  const href = brand.bookingLink || `mailto:${brand.email}?subject=${encodeURIComponent('Book a call with New Media')}`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(brand.email)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      window.location.href = `mailto:${brand.email}`
    }
  }

  return (
    <section aria-labelledby="book-title" className="relative isolate overflow-hidden pt-32 pb-20 text-white sm:pt-40 sm:pb-28">
      <Sky priority scrim position="50% 25%" />
      <div className="shell grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
        <div>
          <p className="label-pill label-pill-dark mb-5">Contact</p>
          <h1 id="book-title" className="display text-[clamp(3rem,9vw,7.6rem)] [text-shadow:0_2px_24px_rgb(5_40_120/0.3)]">
            Book a <span className="serif italic">call.</span>
          </h1>
          <p className="mt-6 max-w-xl text-[1.05rem] leading-relaxed text-white/95 [text-shadow:0_1px_12px_rgb(5_40_120/0.35)] sm:text-lg">
            Tell us what you are launching and when. We reply within one business day.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button href={href} variant="light" size="lg" className="max-sm:w-full">
              {cta.label}
            </Button>
            <button
              type="button"
              onClick={copy}
              className="flex h-13 items-center gap-2 rounded-full px-5 text-sm font-medium text-white ring-1 ring-white/50 ring-inset backdrop-blur-md transition-colors hover:bg-white hover:text-deep max-sm:w-full max-sm:justify-center"
            >
              {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
              {copied ? 'Copied' : brand.email}
            </button>
          </div>
        </div>

        <div className="rounded-3xl bg-page p-6 text-fg sm:p-8">
          <ol className="border-t border-fg/15">
            {steps.map((s, i) => (
              <li key={s} className="flex items-baseline gap-4 border-b border-fg/15 py-4">
                <span className="serif text-2xl text-accent italic">{i + 1}</span>
                <span className="text-[1.05rem] font-medium">{s}</span>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-fg/70">
            {proof.map((p) => (
              <span key={p} className="flex h-6 items-center">
                <ClientLogo name={p} height={16} />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
