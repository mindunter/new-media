import { MotionConfig } from 'motion/react'
import { lazy, Suspense, useEffect, useLayoutEffect } from 'react'
import { BrowserRouter, HashRouter, Route, Routes, useLocation } from 'react-router'
import { PreviewBadge } from './components/PreviewBadge'
import { basename, useHashRouting } from './lib/paths'
import { getLenis, startSmoothScroll } from './lib/scroll'
import Home from './pages/Home'
import { Dialogs, Footer, TopBar } from './site/ui'

// Home loads with the first bundle; the other pages load when visited.
const Work = lazy(() => import('./pages/Work'))
const Live = lazy(() => import('./pages/Live'))
const Process = lazy(() => import('./pages/Process'))
const Contact = lazy(() => import('./pages/Contact'))

const titles: Record<string, string> = {
  '/': 'New Media | Launch amplification on X for AI companies',
  '/work': 'Launches | New Media',
  '/live': 'Launch directory | New Media',
  '/process': 'Process | New Media',
  '/contact': 'Book a call | New Media',
}

/** Starts each page at the top and sets the tab title. */
function PageChange() {
  const { pathname } = useLocation()
  useLayoutEffect(() => {
    const key = pathname.replace(/\/$/, '') || '/'
    document.title = titles[key] ?? titles['/']
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(0, { immediate: true })
    else window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function Shell() {
  return (
    <>
      <PageChange />
      <a href="#main" className="sr-only z-[200] rounded-full bg-deep px-4 py-2 text-on-deep focus:not-sr-only focus:fixed focus:top-4 focus:left-4">
        Skip to content
      </a>
      <TopBar />
      <main id="main">
        <Suspense fallback={<div className="min-h-[100svh] bg-black" />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/work" element={<Work />} />
            <Route path="/live" element={<Live />} />
            <Route path="/process" element={<Process />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <PreviewBadge />
    </>
  )
}

export default function App() {
  useEffect(() => startSmoothScroll(), [])
  const Router = useHashRouting ? HashRouter : BrowserRouter
  return (
    <MotionConfig reducedMotion="user">
      <Router basename={useHashRouting ? undefined : basename}>
        <Dialogs>
          <Shell />
        </Dialogs>
      </Router>
    </MotionConfig>
  )
}
