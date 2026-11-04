import { useLaunchFeed } from '@/site/feed'
import { Directory, LiveStatus } from '@/site/live'
import { CtaBand, PageHero } from '@/site/ui'

export default function Live() {
  const { items, updated } = useLaunchFeed()
  return (
    <>
      <PageHero
        img="liftoff"
        pos="50% 30%"
        caption="Apollo 11 lifts off. Kennedy Space Center, 16 July 1969. NASA."
        label={
          <>
            <span aria-hidden className="live-dot" /> Directory
          </>
        }
        title="Live launches"
        sub="Startup and tech launches, collected as they happen."
      >
        <LiveStatus updated={updated} count={items.length} className="text-white" />
      </PageHero>

      <section aria-label="Launches" className="py-16 sm:py-20">
        <div className="shell">
          <Directory items={items} />
          <p className="mt-14 max-w-2xl text-[0.82rem] text-muted">Collected automatically from public posts. A listing is not an endorsement, and listed companies are not clients unless shown on the Launches page.</p>
        </div>
      </section>
      <CtaBand />
    </>
  )
}
