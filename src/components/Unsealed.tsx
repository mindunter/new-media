import { cta, unsealed } from '@/content'
import { Button } from './Button'
import { Reveal } from './Reveal'

const url = (file: string) => `${import.meta.env.BASE_URL}video/${file}`

/** The finished Unsealed edit. Stays off the site until the video file is added in content.ts. */
export function Unsealed() {
  if (!unsealed.file) return null
  return (
    <section aria-labelledby="unsealed-title" className="bg-deep py-20 text-on-deep sm:py-28">
      <div className="shell grid items-center gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
        <Reveal>
          <p className="label-pill label-pill-dark mb-4">Video work</p>
          <h2 id="unsealed-title" className="display text-[clamp(2.2rem,4.8vw,4.4rem)]">
            {unsealed.title}
          </h2>
          <p className="mt-4 text-[1.05rem] text-on-deep-muted">{unsealed.line}</p>
          <Button href={cta.href} variant="light" size="lg" className="mt-7">
            {cta.label}
          </Button>
        </Reveal>
        <video
          controls
          playsInline
          preload="metadata"
          poster={unsealed.poster ? url(unsealed.poster) : undefined}
          src={url(unsealed.file)}
          className="w-full rounded-3xl bg-black"
        />
      </div>
    </section>
  )
}
