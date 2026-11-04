import { Reveal } from '@/components/Reveal'
import { LaunchCurve } from '@/site/charts'
import { copy, CtaBand, FaqList, Heading, PageHero, SectionHead, spotlight } from '@/site/ui'

export default function Process() {
  return (
    <>
      <PageHero
        img="clouds"
        pos="50% 45%"
        label="Process"
        title="Four phases. One launch hour."
        sub="Two weeks of preparation, a first-hour ranking window, and 30 days of compounding distribution."
      />

      <section aria-labelledby="steps-title" className="py-20 sm:py-24">
        <div className="shell grid gap-12 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-20">
          <Reveal>
            <SectionHead id="steps-title" label="Orchestration" title="How a launch runs" note="Hover a phase to see what happens in it." />
          </Reveal>
          <LaunchCurve phases={copy.steps} />
        </div>
      </section>

      <section aria-labelledby="get-title" className="border-t border-line bg-surface py-20 sm:py-24">
        <div className="shell">
          <Reveal>
            <SectionHead id="get-title" label="Deliverables" title="What ships with every launch" />
          </Reveal>
          <ul className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
            {copy.deliverables.map((d, k) => (
              <li key={d.k} onPointerMove={spotlight} className="spot flex min-h-[180px] flex-col justify-between bg-surface p-5">
                <span className="num text-[0.78rem] text-muted">0{k + 1}</span>
                <span>
                  <span className="block text-[1rem] font-semibold">{d.k}</span>
                  <span className="mt-1 block text-[0.86rem] text-muted">{d.v}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="faq" aria-labelledby="faq-title" className="border-t border-line py-20 sm:py-24">
        <div className="shell grid gap-12 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-20">
          <Reveal>
            <Heading id="faq-title" label="Questions">
              FAQ
            </Heading>
          </Reveal>
          <FaqList />
        </div>
      </section>
      <CtaBand />
    </>
  )
}
