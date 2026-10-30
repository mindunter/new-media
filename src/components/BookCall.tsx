import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { brand, cta } from '@/content'
import { Button } from './Button'
import { ClientLogo } from './ClientLogo'

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
    <section aria-labelledby="book-title" className="bg-page pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="shell grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
        <div>
          <p className="label-pill mb-5">Contact</p>
          <h1 id="book-title" className="display text-[clamp(3rem,9vw,7.6rem)]">
            Book a <span className="serif text-accent italic">call.</span>
          </h1>
          <p className="mt-6 max-w-xl text-[1.05rem] leading-relaxed text-muted sm:text-lg">
            Tell us what you are launching and when. We reply within one business day.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button href={href} variant="signal" size="lg" className="max-sm:w-full">
              {cta.label}
            </Button>
            <button
              type="button"
              onClick={copy}
              className="flex h-13 items-center gap-2 rounded-full px-5 text-sm font-medium text-fg ring-1 ring-fg/25 ring-inset transition-colors hover:bg-fg hover:text-page max-sm:w-full max-sm:justify-center"
            >
              {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
              {copied ? 'Copied' : brand.email}
            </button>
          </div>
        </div>

        <div>
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
