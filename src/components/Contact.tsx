import { AnimatePresence, motion } from 'motion/react'
import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { brand, nav } from '@/content'
import { scrollToHash } from '@/lib/scroll'
import { cn } from '@/lib/utils'
import { Button } from './Button'
import { DotField } from './DotField'
import { LogoFull } from './Logo'
import { WeightText } from './WeightText'

const YEAR = new Date().getFullYear()

const launchTypes = ['Product launch', 'Funding round', 'Podcast', 'Clipping', 'Not sure yet']
const timings = ['This month', 'Next 1 to 3 months', 'Just exploring']

function Chips({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-semibold text-on-deep/70">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = o === value
          return (
            <button
              key={o}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(o)}
              className={cn(
                'rounded-full border px-4 py-2 text-sm transition-all duration-300',
                active
                  ? 'border-accent bg-fill text-on-deep'
                  : 'border-on-deep/20 text-on-deep/80 hover:border-on-deep/60 hover:text-on-deep',
              )}
            >
              {o}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export function Contact() {
  const [kind, setKind] = useState(launchTypes[0])
  const [when, setWhen] = useState(timings[0])
  const [copied, setCopied] = useState(false)

  const subject = encodeURIComponent(`${kind}, ${when.toLowerCase()}`)
  const body = encodeURIComponent(
    `Hi New Media,\n\nWe are planning a ${kind.toLowerCase()} (${when.toLowerCase()}).\n\nCompany:\nWhat we are launching:\nLink:\n`,
  )
  const mailto = `mailto:${brand.email}?subject=${subject}&body=${body}`

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
    <footer
      id="contact"
      className="relative isolate overflow-hidden bg-deep bg-[radial-gradient(60%_50%_at_20%_0%,rgb(47_84_235/0.4),transparent_70%),radial-gradient(50%_50%_at_100%_30%,rgb(122_59_237/0.35),transparent_70%)] text-on-deep"
    >
      <DotField
        onDeep
        className="absolute inset-0 -z-10 h-full w-full opacity-70 [mask-image:linear-gradient(to_bottom,black,transparent_70%)]"
      />
      <div className="shell pt-20 pb-8 sm:pt-28 lg:pt-36">
        <p className="mb-5 flex items-center gap-2.5 text-[0.95rem] font-medium text-on-deep/70">
          <span className="live-dot" aria-hidden /> Booking launches for next quarter
        </p>
        <h2 className="font-display text-[clamp(3.6rem,16vw,16rem)] leading-[0.85] tracking-[-0.045em]">
          <WeightText text="Launch" />
          <br />
          <WeightText text="loud." className="serif text-soft italic" />
        </h2>

        <div className="mt-12 grid gap-8 rounded-3xl bg-deep-2 p-5 sm:mt-16 sm:p-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-12 lg:p-10">
          <div className="space-y-8">
            <Chips label="What are you planning?" options={launchTypes} value={kind} onChange={setKind} />
            <Chips label="When?" options={timings} value={when} onChange={setWhen} />
          </div>
          <div className="flex flex-col justify-between gap-8">
            <p className="text-lg leading-relaxed text-on-deep/70">
              Tell us what you are shipping. We reply within one business day with a plan, a creator shortlist and a
              timeline.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button href={mailto} variant="signal" size="lg" burst>
                Send the brief
              </Button>
              <button
                type="button"
                onClick={copy}
                className="group flex h-14 items-center gap-2 rounded-full px-5 text-sm text-on-deep/70 ring-1 ring-on-deep/15 transition hover:text-on-deep hover:ring-on-deep/50"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={copied ? 'y' : 'n'}
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -8, opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
                    {copied ? 'Copied' : brand.email}
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-10 border-t border-on-deep/10 pt-10 sm:mt-24 md:grid-cols-[1fr_auto_auto] md:gap-20">
          <div className="col-span-2 md:col-span-1">
            <LogoFull className="h-auto w-40 text-on-deep" />
            <p className="mt-4 max-w-xs text-sm text-on-deep/60">
              Creator distribution for AI and tech companies. Launches impossible to scroll past.
            </p>
          </div>
          <nav aria-label="Footer">
            <p className="mb-3 text-sm font-semibold text-on-deep/60">Site</p>
            <ul className="space-y-2">
              {nav.map((n) => (
                <li key={n.href}>
                  <a
                    href={n.href}
                    onClick={(e) => {
                      e.preventDefault()
                      scrollToHash(n.href)
                    }}
                    className="text-on-deep/75 transition-colors hover:text-soft"
                  >
                    {n.label}
                  </a>
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

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 text-sm text-on-deep/60 sm:mt-16">
          <p>© {YEAR} New Media. All rights reserved.</p>
          <button
            type="button"
            onClick={() => scrollToHash('#top')}
            className="transition-colors hover:text-on-deep"
          >
            Back to top ↑
          </button>
        </div>
      </div>
    </footer>
  )
}
