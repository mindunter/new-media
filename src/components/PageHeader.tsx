import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { cta } from '@/content'
import { art } from '@/lib/paths'
import { Button } from './Button'
import { DotField } from './DotField'
import { Sky } from './Sky'

type Props = {
  label: string
  title: ReactNode
  lead: string
  /** Optional 3D render shown beside the title on wide screens. */
  image?: { file: string; alt: string }
}

const ease = [0.16, 1, 0.3, 1] as const

/** Compact header for inner pages: a label, a title, one line of context and the call to action. */
export function PageHeader({ label, title, lead, image }: Props) {
  return (
    <header className="relative isolate overflow-hidden bg-page text-white">
      <Sky priority scrim position="50% 25%" />
      <DotField
        onDeep
        className="absolute inset-0 -z-10 h-full w-full opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent_70%)]"
      />
      <div className="shell grid items-center gap-8 pt-32 pb-14 sm:pt-40 sm:pb-20 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease }}>
          <p className="label-pill label-pill-dark mb-5">{label}</p>
          <h1 className="display text-[clamp(2.6rem,6.4vw,5.6rem)] [text-shadow:0_2px_24px_rgb(5_40_120/0.3)]">{title}</h1>
          <p className="mt-5 max-w-xl text-[1.05rem] leading-relaxed text-white/95 [text-shadow:0_1px_12px_rgb(5_40_120/0.35)] sm:text-lg">{lead}</p>
          <div className="mt-7">
            <Button href={cta.href} variant="light" size="lg">
              {cta.label}
            </Button>
          </div>
        </motion.div>
        {image && (
          <motion.img
            src={art(image.file)}
            alt={image.alt}
            className="mx-auto hidden w-full max-w-[400px] md:block"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease, delay: 0.15 }}
          />
        )}
      </div>
    </header>
  )
}
