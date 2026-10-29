import { AnimatePresence, motion } from 'motion/react'
import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { brand } from '@/content'
import { art } from '@/lib/paths'
import { cn } from '@/lib/utils'
import { Button } from './Button'
import { DotField } from './DotField'
import { WeightText } from './WeightText'

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

/** The brief builder with the big "Launch loud." headline. Lives on the Contact page. */
export function BriefForm() {
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
    <section
      id="brief"
      aria-label="Send us a brief"
      className="relative isolate overflow-hidden bg-deep bg-[radial-gradient(60%_50%_at_20%_0%,rgb(47_84_235/0.4),transparent_70%),radial-gradient(50%_50%_at_100%_30%,rgb(122_59_237/0.35),transparent_70%)] text-on-deep"
    >
      <img
        src={art("sky-dark.webp")}
        alt=""
        aria-hidden
        loading="lazy"
        className="absolute inset-x-0 top-0 -z-20 h-[70%] w-full object-cover object-bottom opacity-80 [mask-image:linear-gradient(to_bottom,black_40%,transparent)]"
      />
      <DotField
        onDeep
        className="absolute inset-0 -z-10 h-full w-full opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent_70%)]"
      />
      <img
        src={art("obj-tv.webp")}
        alt=""
        aria-hidden
        loading="lazy"
        className="pointer-events-none absolute top-[6%] right-[-4%] -z-10 hidden w-[min(46vw,640px)] animate-[floaty_7s_ease-in-out_infinite] drop-shadow-[0_40px_50px_rgb(0_0_0/0.45)] md:block"
      />
      <div className="shell pt-32 pb-20 sm:pt-40 sm:pb-28">
        <p className="mb-5 flex items-center gap-2.5 text-[0.95rem] font-medium text-on-deep/70">
          <span className="live-dot" aria-hidden /> Booking launches for next quarter
        </p>
        <h1 className="font-display text-[clamp(3.6rem,16vw,16rem)] leading-[0.85] tracking-[-0.045em]">
          <WeightText text="Launch" />
          <br />
          <WeightText text="loud." className="serif text-soft italic" />
        </h1>

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

      </div>
    </section>
  )
}
