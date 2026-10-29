import { BriefForm } from '@/components/BriefForm'
import { Faq } from '@/components/Faq'

/** Contact: the brief builder up top (it carries its own sky header), then the FAQ. */
export default function Contact() {
  return (
    <>
      <BriefForm />
      <Faq />
    </>
  )
}
