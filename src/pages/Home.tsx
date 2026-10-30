import { Hero } from '@/components/Hero'
import { ServicesPreview, WorkPreview } from '@/components/HomePreviews'
import { Marquee } from '@/components/Marquee'
import { Portfolio, Reasons } from '@/components/Portfolio'
import { Stats } from '@/components/Stats'

/** Home: the promise, the clients, the numbers, why us. Everything leads to booking a call. */
export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <Stats />
      <Portfolio />
      <Reasons />
      <div className="pt-20 sm:pt-28">
        <WorkPreview />
      </div>
      <ServicesPreview />
    </>
  )
}
