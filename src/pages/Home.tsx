import { Backers } from '@/components/Backers'
import { Hero } from '@/components/Hero'
import { ServicesPreview } from '@/components/HomePreviews'
import { Marquee } from '@/components/Marquee'
import { Memes } from '@/components/Memes'
import { Numbers } from '@/components/Numbers'
import { Portfolio, Reasons } from '@/components/Portfolio'
import { Stats } from '@/components/Stats'
import { Unsealed } from '@/components/Unsealed'
import { XPosts } from '@/components/XPosts'

/** Home: the promise, the clients, who backs them, the proof, why us. Everything leads to booking a call. */
export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <Stats />
      <Portfolio />
      <Backers />
      <XPosts />
      <Numbers />
      <Memes />
      <Unsealed />
      <Reasons />
      <div className="pt-20 sm:pt-28">
        <ServicesPreview />
      </div>
    </>
  )
}
