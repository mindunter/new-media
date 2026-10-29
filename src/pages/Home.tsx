import { Hero } from '@/components/Hero'
import { ServicesPreview, WorkPreview } from '@/components/HomePreviews'
import { Manifesto } from '@/components/Manifesto'
import { Marquee } from '@/components/Marquee'
import { Stats } from '@/components/Stats'

/** Home: the pitch in brief, with previews that lead to the full pages. */
export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <Stats />
      <Manifesto />
      <WorkPreview />
      <ServicesPreview />
    </>
  )
}
