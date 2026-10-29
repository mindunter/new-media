import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { art } from '@/lib/paths'
import { DotField } from './DotField'

type Props = {
  label: string
  title: ReactNode
  lead: string
  /** Optional 3D render shown beside the title on wide screens. */
  image?: { file: string; alt: string }
}

const ease = [0.16, 1, 0.3, 1] as const

/** Compact header for inner pages: the hero sky, a label, a title and one line of context. */
export function PageHeader({ label, title, lead, image }: Props) {
  return (
    <header className="hero-sky relative isolate overflow-hidden text-white">
      <DotField
        onDeep
        className="absolute inset-0 -z-10 h-full w-full opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
      />
      <div className="shell grid items-center gap-8 pt-32 pb-16 sm:pt-40 sm:pb-20 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div>
          <motion.p
            className="label-pill label-pill-dark mb-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
          >
            {label}
          </motion.p>
          <motion.h1
            className="display text-[clamp(2.6rem,6.4vw,5.6rem)] [text-shadow:0_2px_30px_rgb(10_20_90/0.25)]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.05 }}
          >
            {title}
          </motion.h1>
          <motion.p
            className="mt-5 max-w-xl text-[1.05rem] leading-relaxed text-white/90 sm:text-lg"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.15 }}
          >
            {lead}
          </motion.p>
        </div>
        {image && (
          <motion.img
            src={art(image.file)}
            alt={image.alt}
            className="mx-auto hidden w-full max-w-[420px] animate-[floaty_7s_ease-in-out_infinite] drop-shadow-[0_30px_40px_rgb(10_20_90/0.4)] md:block"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease, delay: 0.2 }}
          />
        )}
      </div>
    </header>
  )
}
