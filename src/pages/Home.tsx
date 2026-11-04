import { Button } from '@/components/Button'
import { Reveal } from '@/components/Reveal'
import { LaunchCurve } from '@/site/charts'
import { byViews, copy, CtaBand, Figures, LiveTicker, LogoFlow, More, PageHero, PostWall, SectionHead, Trust, useDialog } from '@/site/ui'
import { TopThisWeek, xweek } from '@/site/xweek'

export default function Home() {
  const open = useDialog()
  return (
    <>
      <PageHero tall align="top" img="moon" pos="50% 60%" title={copy.hero} sub={copy.sub} foot={<LogoFlow className="pb-4 text-white" />}>
        <button type="button" onClick={() => open('launch')} className="h-11 rounded-full bg-white px-5 text-[0.95rem] font-semibold text-black transition-colors hover:bg-fill hover:text-white">
          Create launch
        </button>
        <Button href="/live" variant="outlineDark" size="md" arrow={false} className="text-white ring-white/30 hover:bg-white hover:text-black">
          Browse the directory
        </Button>
      </PageHero>

      <LiveTicker />
      <Figures />

      <section aria-labelledby="work-title" className="py-20 sm:py-24">
        <div className="shell">
          <Reveal>
            <SectionHead id="work-title" label="Proof of reach" title="Selected launches" note="Our highest-reach launches on X, with live post metrics." action={<More to="/work">All launches</More>} />
          </Reveal>
          <div className="mt-12">
            <PostWall list={byViews.slice(0, 7)} />
          </div>
        </div>
      </section>

      <section aria-labelledby="week-title" className="border-t border-line py-20 sm:py-24">
        <div className="shell">
          <Reveal>
            <SectionHead id="week-title" label="Directory" title="Top launches this week" note={`${xweek.window}, ranked by views on X.`} action={<More to="/live">Open the directory</More>} />
          </Reveal>
          <div className="mt-12">
            <TopThisWeek />
          </div>
        </div>
      </section>

      <section aria-labelledby="process-title" className="border-t border-line py-20 sm:py-24">
        <div className="shell grid gap-12 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-20">
          <Reveal className="flex flex-col items-start gap-8">
            <SectionHead id="process-title" label="Orchestration" title="One launch hour, engineered" note="Two weeks of preparation for the hour that sets your reach." />
            <More to="/process">How it works</More>
          </Reveal>
          <LaunchCurve phases={copy.steps} />
        </div>
      </section>

      <Trust />
      <CtaBand />
    </>
  )
}
