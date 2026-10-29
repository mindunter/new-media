import { MotionConfig } from 'motion/react'
import { lazy, Suspense, useEffect, useLayoutEffect } from 'react'
import { BrowserRouter, HashRouter, Route, Routes, useLocation } from 'react-router'
import { BurstSprites } from './components/BurstSprites'
import { Nav } from './components/Nav'
import { PreviewBadge } from './components/PreviewBadge'
import { SiteFooter } from './components/SiteFooter'
import { basename, useHashRouting } from './lib/paths'
import { getLenis, startSmoothScroll } from './lib/scroll'
import Home from './pages/Home'

// Home loads with the first bundle; the other pages load when visited.
const Work = lazy(() => import('./pages/Work'))
const Services = lazy(() => import('./pages/Services'))
const HowItWorks = lazy(() => import('./pages/HowItWorks'))
const Contact = lazy(() => import('./pages/Contact'))

const titles: Record<string, string> = {
  '/': 'New Media | Launches impossible to scroll past',
  '/work': 'Work | New Media',
  '/services': 'Services | New Media',
  '/how-it-works': 'How it works | New Media',
  '/contact': 'Contact | New Media',
}

/** Starts each page at the top (or at #id when the link has one) and sets the tab title. */
function PageChange() {
  const { pathname, hash } = useLocation()
  useLayoutEffect(() => {
    const key = pathname.replace(/\/$/, '') || '/'
    document.title = titles[key] ?? titles['/']
    const lenis = getLenis()
    if (hash.length > 1 && !useHashRouting) {
      // Wait a frame so lazily loaded sections exist before scrolling to them.
      requestAnimationFrame(() => document.querySelector(hash)?.scrollIntoView())
    } else if (lenis) lenis.scrollTo(0, { immediate: true })
    else window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

function Shell() {
  return (
    <>
      <PageChange />
      <a
        href="#main"
        className="sr-only z-[200] rounded-full bg-deep px-4 py-2 text-on-deep focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <Suspense fallback={<div className="hero-sky min-h-[100svh]" />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/work" element={<Work />} />
            <Route path="/services" element={<Services />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </main>
      <SiteFooter />
      <PreviewBadge />
      <BurstSprites />
    </>
  )
}

export default function App() {
  useEffect(() => startSmoothScroll(), [])
  const Router = useHashRouting ? HashRouter : BrowserRouter
  return (
    <MotionConfig reducedMotion="user">
      <Router basename={useHashRouting ? undefined : basename}>
        <Shell />
      </Router>
    </MotionConfig>
  )
}
