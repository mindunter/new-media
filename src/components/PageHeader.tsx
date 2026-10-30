import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { cta } from '@/content'
import { art } from '@/lib/paths'
import { Button } from './Button'
import { DotField } from './DotField'

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
    <header className="relative isolate overflow-hidden border-b border-fg/10 bg-page">
      <DotField className="absolute inset-0 -z-10 h-full w-full [mask-image:radial-gradient(80%_90%_at_80%_40%,black_20%,transparent_85%)]" />
      <div className="shell grid items-center gap-8 pt-32 pb-14 sm:pt-40 sm:pb-20 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease }}>
          <p className="label-pill mb-5">{label}</p>
          <h1 className="display text-[clamp(2.6rem,6.4vw,5.6rem)]">{title}</h1>
          <p className="mt-5 max-w-xl text-[1.05rem] leading-relaxed text-muted sm:text-lg">{lead}</p>
          <div className="mt-7">
            <Button href={cta.href} variant="signal" size="lg">
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
