import { AllLaunches } from '@/components/AllLaunches'
import { Cases } from '@/components/Cases'
import { PageHeader } from '@/components/PageHeader'

export default function Work() {
  return (
    <>
      <PageHeader
        label="Work"
        title={
          <>
            Launches that <span className="serif chrome italic">trended.</span>
          </>
        }
        lead="24.3M+ views and $144.5M+ in funding announced across launches for 10 AI and tech companies since May 2026."
        image={{ file: 'obj-tv.webp', alt: 'Chrome TV showing a launch' }}
      />
      <Cases />
      <AllLaunches />
    </>
  )
}
