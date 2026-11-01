import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { brand } from '@/content'
import { BookingCalendar } from './BookingCalendar'
import { ClientLogo } from './ClientLogo'
import { Sky } from './Sky'

const proof = ['Reactor', 'Sazabi', 'Runlayer', 'BackOps', 'Beacon']

/** Contact page lead: the calendar, right away, and an email address for anyone who prefers one. */
export function BookCall() {
  const [copied, setCopied] = useState(false)

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
    <section aria-labelledby="book-title" className="relative isolate overflow-hidden pt-28 pb-16 text-white sm:pt-36 sm:pb-24">
      <Sky priority scrim position="50% 25%" />
      <div className="shell grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
        <div>
          <p className="label-pill label-pill-dark mb-5">Contact</p>
          <h1 id="book-title" className="display text-[clamp(3rem,8vw,7rem)] [text-shadow:0_2px_24px_rgb(5_40_120/0.3)]">
            Book a <span className="serif italic">call.</span>
          </h1>
          <p className="mt-6 max-w-xl text-[1.05rem] leading-relaxed text-white [text-shadow:0_1px_12px_rgb(5_40_120/0.35)] sm:text-lg">
            Pick a day, pick a time, add your email. No forms, no back and forth. Tell us what you are launching on the call.
          </p>
          <button
            type="button"
            onClick={copy}
            className="mt-6 flex h-12 items-center gap-2 rounded-full bg-[#062a78]/60 px-5 text-sm font-medium text-white ring-1 ring-white/40 ring-inset backdrop-blur-md transition-colors hover:bg-white hover:text-deep"
          >
            {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
            {copied ? 'Copied' : brand.email}
          </button>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            {proof.map((p) => (
              <span key={p} className="flex h-6 items-center">
                <ClientLogo name={p} height={16} />
              </span>
            ))}
          </div>
        </div>
        <BookingCalendar />
      </div>
    </section>
  )
}
