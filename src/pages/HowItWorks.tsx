import { Engine } from '@/components/Engine'
import { Network } from '@/components/Network'
import { PageHeader } from '@/components/PageHeader'
import { Simulator } from '@/components/Simulator'

export default function HowItWorks() {
  return (
    <>
      <PageHeader
        label="How it works"
        title={
          <>
            From brief to <span className="serif chrome italic">trending.</span>
          </>
        }
        lead="A month of planning, one coordinated hour, and weeks of follow-through. Here is the timeline, the network behind it, and a way to estimate your own launch."
        image={{ file: 'obj-clapper.webp', alt: 'Chrome clapperboard' }}
      />
      <Engine />
      <Network />
      <Simulator />
    </>
  )
}
