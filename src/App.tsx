import { MotionConfig } from 'motion/react'
import { lazy, Suspense, useEffect } from 'react'
import { BurstSprites } from './components/BurstSprites'
import { Hero } from './components/Hero'
import { Marquee } from './components/Marquee'
import { Nav } from './components/Nav'
import { PreviewBadge } from './components/PreviewBadge'
import { Stats } from './components/Stats'
import { startSmoothScroll } from './lib/scroll'

// Everything below the fold loads in a second chunk so the hero paints sooner.
const Below = lazy(() => import('./below'))

export default function App() {
  useEffect(() => startSmoothScroll(), [])

  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#main"
        className="sr-only z-[200] rounded-full bg-deep px-4 py-2 text-on-deep focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <Hero />
        <Marquee />
        <Stats />
        <Suspense fallback={<div className="min-h-[200vh] bg-deep" />}>
          <Below />
        </Suspense>
      </main>
      <PreviewBadge />
      <BurstSprites />
    </MotionConfig>
  )
}
