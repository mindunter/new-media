import { useState } from 'react'
import { Reveal } from '@/components/Reveal'
import { asOf, posts, totalViews } from '@/content'
import { cn } from '@/lib/utils'
import { byDate, byViews, companies, CtaBand, Figures, millions, PageHero, PostWall, SectionHead, Trust } from '@/site/ui'

export default function Work() {
  const [sort, setSort] = useState<'views' | 'new'>('views')
  return (
    <>
      <PageHero
        img="overlook"
        pos="50% 35%"
        align="low"
        label="Launches"
        title="Proof, on the record."
        sub={`${posts.length} launches for ${companies} AI companies. ${millions(totalViews)} verified views on X.`}
      />
      <Figures />
      <section aria-labelledby="launches-title" className="py-20 sm:py-24">
        <div className="shell">
          <Reveal>
            <SectionHead
              id="launches-title"
              label="Archive"
              title="All launches"
              note={`Public posts on X. Metrics as of ${asOf}.`}
              action={
                <div role="group" aria-label="Sort launches" className="flex rounded-full border border-line p-1 text-[0.82rem]">
                  {(
                    [
                      ['views', 'Most viewed'],
                      ['new', 'Newest'],
                    ] as const
                  ).map(([k, l]) => (
                    <button key={k} type="button" aria-pressed={sort === k} onClick={() => setSort(k)} className={cn('h-8 rounded-full px-3.5 font-medium transition-colors', sort === k ? 'bg-fg text-page' : 'text-muted hover:text-fg')}>
                      {l}
                    </button>
                  ))}
                </div>
              }
            />
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
