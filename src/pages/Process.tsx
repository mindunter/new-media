import { Check } from 'lucide-react'
import { Reveal } from '@/components/Reveal'
import { copy, CtaBand, FaqList, Heading, PageHero, Steps } from '@/site/ui'

export default function Process() {
  return (
    <>
      <PageHero
        img="eagle"
        layout="full"
        pos="50% 60%"
        caption="Eagle returns from the surface, Earth above the Moon. Apollo 11, 21 July 1969. NASA."
        label="Process"
        title="Four steps. One launch hour."
        sub="Two weeks of preparation, one hour that sets the reach, and 30 days of follow-up."
      />

      <section aria-labelledby="steps-title" className="py-20 sm:py-24">
        <div className="shell grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
          <Reveal className="lg:self-start">
            <Heading id="steps-title" note="One team, one plan, one report.">
              How it works
            </Heading>
          </Reveal>
          <Steps detail />
        </div>
      </section>

      <section aria-labelledby="get-title" className="border-t border-line bg-surface py-20 sm:py-24">
        <div className="shell grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
          <Reveal>
            <Heading id="get-title">What you get</Heading>
          </Reveal>
          <ul className="border-t border-line">
            {copy.deliverables.map((d) => (
              <li key={d} className="flex items-center gap-4 border-b border-line py-5">
                <Check size={16} aria-hidden className="shrink-0 text-accent" />
                {d}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="faq" aria-labelledby="faq-title" className="border-t border-line py-20 sm:py-24">
        <div className="shell grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
          <Reveal>
            <Heading id="faq-title">FAQ</Heading>
          </Reveal>
          <FaqList />
        </div>
      </section>
      <CtaBand />
    </>
  )
}
