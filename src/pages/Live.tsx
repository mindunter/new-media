import { Reveal } from '@/components/Reveal'
import { useLaunchFeed } from '@/site/feed'
import { Directory, LiveStatus } from '@/site/live'
import { MemeWall } from '@/site/memes'
import { CtaBand, PageHero, SectionHead } from '@/site/ui'
import { Breakdown, EmbedWall, TopThisWeek, WeekGrid, xweek } from '@/site/xweek'

function Block({ id, label, title, note, action, children, tint }: { id: string; label: string; title: string; note: string; action?: React.ReactNode; children: React.ReactNode; tint?: boolean }) {
  return (
    <section aria-labelledby={id} className={tint ? 'border-t border-line bg-surface py-20 sm:py-24' : 'border-t border-line py-20 sm:py-24'}>
      <div className="shell">
        <Reveal>
          <SectionHead id={id} label={label} title={title} note={note} action={action} />
        </Reveal>
        <div className="mt-12">{children}</div>
      </div>
    </section>
  )
}

export default function Live() {
  const { items, updated } = useLaunchFeed()
  return (
    <>
      <PageHero
        img="liftoff"
        pos="50% 40%"
        align="low"
        label={
          <>
            <span aria-hidden className="live-dot" /> Launch directory
          </>
        }
        title="Every launch worth knowing, ranked by reach."
        sub="The week's top startup launches on X, broken down by views and type, with a live feed of what is shipping right now."
      >
        <LiveStatus updated={updated} count={items.length} className="text-white" />
      </PageHero>

      <Block id="top-title" label="This week" title="Top launches this week" note={`${xweek.window}, ranked by views on X.`}>
        <TopThisWeek />
      </Block>

      <Block id="breakdown-title" label="Analysis" title="Launch breakdowns" note="Where the week's attention went, by launch and by type." tint>
        <Breakdown />
      </Block>

      <Block id="week-title" label="Index" title="Launches this week" note="Every launch in the index, ranked by views. Open any one for the full post.">
        <WeekGrid />
      </Block>

      <Block id="posts-title" label="On X" title="Top posts, in full" note="The posts themselves, embedded from X." tint>
        <EmbedWall />
      </Block>

      <Block id="feed-title" label="Real time" title="Shipping now" note="Show HN and Launch HN, refreshed every minute." action={<LiveStatus updated={updated} count={items.length} className="text-muted" />}>
        <Directory items={items} />
      </Block>

      <Block id="memes-title" label="Culture" title="Launch day, as the timeline sees it" note="Hour one, in clips.">
        <MemeWall />
      </Block>

      <p className="shell border-t border-line py-8 text-[0.78rem] text-muted">
        Collected from public posts on X and Hacker News. X figures as of {xweek.asOf}. A listing is not an endorsement, and listed companies are not clients unless shown on the Launches page.
      </p>
      <CtaBand />
    </>
  )
}
