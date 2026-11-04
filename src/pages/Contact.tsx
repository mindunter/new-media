import { Reveal } from '@/components/Reveal'
import { brand } from '@/content'
import { BookPanel, Heading, PageHero } from '@/site/ui'

export default function Contact() {
  return (
    <>
      <PageHero
        img="moon"
        pos="50% 75%"
        align="top"
        label="Contact"
        title="Book a call"
        sub="30 minutes. Your launch, your date, our plan."
      />
      <section aria-labelledby="book-title" className="py-20 sm:py-24">
        <div className="shell grid items-start gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <Heading id="book-title" note="Pick a time, or email us with your launch date.">
              Pick a time
            </Heading>
            <p className="mt-8 text-muted">
              Email{' '}
              <a href={`mailto:${brand.email}`} className="font-semibold text-fg underline decoration-line underline-offset-4 hover:decoration-fg">
                {brand.email}
              </a>
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <BookPanel />
          </Reveal>
        </div>
      </section>
    </>
  )
}
