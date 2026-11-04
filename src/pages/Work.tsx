import { useState } from 'react'
import { Reveal } from '@/components/Reveal'
import { asOf, posts, totalViews } from '@/content'
import { cn } from '@/lib/utils'
import { byDate, byViews, companies, CtaBand, Figures, Heading, millions, PageHero, PostWall, Trust } from '@/site/ui'

export default function Work() {
  const [sort, setSort] = useState<'views' | 'new'>('views')
  return (
    <>
      <PageHero
        img="bootprint"
        layout="full"
        pos="50% 55%"
        dim
        caption="A bootprint in lunar soil. Apollo 11, 1969. NASA."
        label="Launches"
        title="Proof, on the record."
        sub={`${posts.length} launches for ${companies} AI companies. ${millions(totalViews)} views on X.`}
      />
      <Figures />
      <section aria-labelledby="launches-title" className="py-20 sm:py-24">
        <div className="shell">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <Heading id="launches-title" note={`Public posts on X. Figures as of ${asOf}.`}>
              All launches
            </Heading>
            <div role="group" aria-label="Sort launches" className="flex rounded-full border border-line p-1 text-sm">
              {(
                [
                  ['views', 'Most viewed'],
                  ['new', 'Newest'],
                ] as const
              ).map(([k, l]) => (
                <button key={k} type="button" aria-pressed={sort === k} onClick={() => setSort(k)} className={cn('rounded-full px-4 py-1.5 font-medium transition-colors', sort === k ? 'bg-fg text-page' : 'text-muted hover:text-fg')}>
                  {l}
                </button>
              ))}
            </div>
          </Reveal>
          <div className="mt-12">
            <PostWall list={sort === 'views' ? byViews : byDate} />
          </div>
        </div>
      </section>
      <Trust />
      <CtaBand />
    </>
  )
}
