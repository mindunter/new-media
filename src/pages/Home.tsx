import { Button } from '@/components/Button'
import { Reveal } from '@/components/Reveal'
import { useLaunchFeed, useNow } from '@/site/feed'
import { LiveRow, LiveStatus } from '@/site/live'
import { byViews, copy, CtaBand, Figures, Heading, LogoFlow, More, PageHero, PostWall, Steps, Trust } from '@/site/ui'

function LivePreview() {
  const { items, updated } = useLaunchFeed()
  const now = useNow()
  return (
    <section aria-labelledby="live-title" className="border-t border-line py-20 sm:py-24">
      <div className="shell grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
        <Reveal className="lg:self-start">
          <Heading id="live-title" label="Directory" note="Startup and tech launches, collected as they happen.">
            Live launches
          </Heading>
          <LiveStatus updated={updated} count={items.length} className="mt-6 text-muted" />
          <div className="mt-8">
            <More to="/live">Open the directory</More>
          </div>
        </Reveal>
        <ul className="border-t border-line">
          {items.slice(0, 6).map((it) => (
            <LiveRow key={it.id} it={it} now={now} />
          ))}
          {!items.length && <li className="py-6 text-muted">Loading launches…</li>}
        </ul>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <>
      <PageHero
        tall
        img="moonwalk"
        pos="50% 38%"
        caption="Buzz Aldrin on the Moon. Apollo 11, 20 July 1969. NASA."
        title={copy.hero}
        sub={copy.sub}
        foot={<LogoFlow className="pb-6 text-white" />}
      >
        <Button href="/contact" variant="light" size="md" className="shadow-none">
          Book a call
        </Button>
        <Button href="/work" variant="outlineDark" size="md" arrow={false} className="text-white ring-white/30 hover:bg-white hover:text-black">
          See launches
        </Button>
      </PageHero>

      <Figures />

      <section aria-labelledby="work-title" className="py-20 sm:py-24">
        <div className="shell">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <Heading id="work-title" label="Launches" note="Our most viewed launches on X.">
              Selected work
            </Heading>
            <More to="/work">All launches</More>
          </Reveal>
          <div className="mt-12">
            <PostWall list={byViews.slice(0, 7)} />
          </div>
        </div>
      </section>

      <LivePreview />

      <section aria-labelledby="process-title" className="border-t border-line py-20 sm:py-24">
        <div className="shell grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
          <Reveal className="lg:self-start">
            <Heading id="process-title" label="Process" note="One team, one plan, one report.">
              How a launch runs
            </Heading>
            <div className="mt-8">
              <More to="/process">How it works</More>
            </div>
          </Reveal>
          <Steps />
        </div>
      </section>

      <Trust />
      <CtaBand />
    </>
  )
}
