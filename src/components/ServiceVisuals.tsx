import { motion } from 'motion/react'

const loop = { repeat: Infinity, repeatType: 'mirror' as const }

function LaunchVisual() {
  const bars = [12, 14, 13, 18, 22, 30, 96, 88, 70, 62, 58, 54]
  return (
    <div className="flex h-full items-end gap-1.5 p-6">
      {bars.map((b, i) => (
        <motion.span
          key={i}
          className={i === 6 ? 'flex-1 rounded-t-md bg-fill' : 'flex-1 rounded-t-md bg-base/25'}
          initial={{ height: '4%' }}
          animate={{ height: `${b}%` }}
          transition={{ duration: 0.9, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
    </div>
  )
}

function ClippingVisual() {
  return (
    <div className="grid h-full grid-cols-4 gap-2 p-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.span
          key={i}
          className="relative overflow-hidden rounded-lg bg-base/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.6 }}
        >
          <motion.span
            className="absolute inset-x-0 bottom-0 bg-fill/70"
            animate={{ height: ['20%', `${40 + ((i * 37) % 55)}%`] }}
            transition={{ ...loop, duration: 1.4 + (i % 3) * 0.4 }}
          />
          <span className="absolute top-1.5 left-1.5 h-1.5 w-1.5 rounded-full bg-live" />
        </motion.span>
      ))}
    </div>
  )
}

function PodcastVisual() {
  return (
    <div className="flex h-full items-center justify-center gap-[3px] px-6">
      {Array.from({ length: 42 }).map((_, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-base/70"
          animate={{ height: [`${8 + ((i * 13) % 20)}%`, `${30 + ((i * 29) % 60)}%`] }}
          transition={{ ...loop, duration: 0.5 + (i % 5) * 0.12, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

function UgcVisual() {
  return (
    <div className="flex h-full items-center justify-center gap-3 p-5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="relative block aspect-[9/16] h-[86%] overflow-hidden rounded-xl border border-on-deep/20 bg-gradient-to-b from-on-deep/15 to-on-deep/5"
          initial={{ y: 30, rotate: (i - 1) * 6, opacity: 0 }}
          animate={{ y: i === 1 ? -8 : 0, rotate: (i - 1) * 6, opacity: 1 }}
          transition={{ delay: i * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="absolute inset-x-2 bottom-2 h-1 overflow-hidden rounded-full bg-base/20">
            <motion.span
              className="block h-full bg-fill"
              animate={{ width: ['0%', '100%'] }}
              transition={{ duration: 2.4 + i * 0.5, repeat: Infinity, ease: 'linear' }}
            />
          </span>
        </motion.span>
      ))}
    </div>
  )
}

const visuals: Record<string, () => React.JSX.Element> = {
  launch: LaunchVisual,
  clipping: ClippingVisual,
  podcast: PodcastVisual,
  ugc: UgcVisual,
}

/** Small animated preview for a service row, keyed by service id. */
export function ServiceVisual({ id }: { id: string }) {
  const Visual = visuals[id]
  return Visual ? <Visual /> : null
}
