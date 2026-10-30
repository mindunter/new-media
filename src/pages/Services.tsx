import { PageHeader } from '@/components/PageHeader'
import { Platforms } from '@/components/Platforms'
import { Services as ServiceCards } from '@/components/Services'

export default function Services() {
  return (
    <>
      <PageHeader
        label="Services"
        title={
          <>
            Four ways to get <span className="serif italic">seen.</span>
          </>
        }
        lead="Launch campaigns, clipping, founder podcasts and creator video, run by one team so every piece tells the same story."
        image={{ file: 'obj-megaphone.webp', alt: 'Chrome megaphone' }}
      />
      <ServiceCards bare />
      <Platforms />
    </>
  )
}
