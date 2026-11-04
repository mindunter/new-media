import { MotionConfig } from 'motion/react'
import { useEffect } from 'react'
import { PreviewBadge } from './components/PreviewBadge'
import { startSmoothScroll } from './lib/scroll'
import OnePage from './pages/OnePage'

// The site is one page. The older multi-page version is kept at the git tag draft-v5-multipage.
export default function App() {
  useEffect(() => {
    document.title = 'New Media | Launch amplification on X for AI companies'
    return startSmoothScroll()
  }, [])
  return (
    <MotionConfig reducedMotion="user">
      <OnePage />
      <PreviewBadge />
    </MotionConfig>
  )
}
