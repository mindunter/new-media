import { motion, useInView } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { memes } from '@/content'
import { art } from '@/lib/paths'
import { cn, prefersReducedMotion } from '@/lib/utils'
import { ease } from './ui'

/** The single-file preview embeds only the stills, so it skips the clips. */
const hasVideo = () => !(window as unknown as { __NM_ART__?: unknown }).__NM_ART__
const layout = ['sm:col-span-2 sm:row-span-2', '', '', 'sm:row-span-2', '', 'sm:col-span-2', '', '']

/** One looping clip. A shimmer and a pulsing "loading" label hold its place until it can play. */
function Clip({ id, caption, on, className }: { id: string; caption: string; on: boolean; className?: string }) {
  const v = useRef<HTMLVideoElement>(null)
  const [ready, setReady] = useState(false)
  const video = hasVideo() && !prefersReducedMotion()
  useEffect(() => {
    const el = v.current
    if (!el) return
    if (on) el.play().catch(() => {})
    else el.pause()
  }, [on, ready])
  return (
    <figure className={cn('group relative overflow-hidden rounded-2xl bg-fg/5', className)}>
      {!ready && (
        <div className="shimmer absolute inset-0 grid place-items-center">
          <span className="num flex items-center gap-1 text-[0.72rem] text-muted">
            loading
            {[0, 1, 2].map((k) => (
              <motion.span key={k} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.2, repeat: Infinity, delay: k * 0.2 }}>
                .
              </motion.span>
            ))}
          </span>
        </div>
      )}
      {video ? (
        <video
          ref={v}
          src={art(`memes/${id}.mp4`)}
          poster={art(`memes/${id}.webp`)}
          muted
          loop
          playsInline
          preload="none"
          onLoadedData={() => setReady(true)}
          onCanPlay={() => setReady(true)}
          className={cn('h-full w-full object-cover transition-opacity duration-500', ready ? 'opacity-100' : 'opacity-0')}
        />
      ) : (
        <img src={art(`memes/${id}.webp`)} alt="" loading="lazy" onLoad={() => setReady(true)} className={cn('h-full w-full object-cover transition-opacity duration-500', ready ? 'opacity-100' : 'opacity-0')} />
      )}
      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pt-10 pb-3.5 text-[0.84rem] font-medium text-white">{caption}</figcaption>
    </figure>
  )
}

/** Launch day, as the timeline sees it. Clips play only while the wall is on screen. */
export function MemeWall() {
  const ref = useRef<HTMLDivElement>(null)
  const near = useInView(ref, { margin: '200px 0px' })
  const [start, setStart] = useState(0)
  // Every 9 seconds the wall moves on to the next set.
  useEffect(() => {
    if (!near || prefersReducedMotion()) return
    const id = window.setInterval(() => setStart((s) => (s + 8) % memes.length), 9000)
    return () => window.clearInterval(id)
  }, [near])
  const set = Array.from({ length: 8 }, (_, k) => memes[(start + k) % memes.length])
  return (
    <div ref={ref} className="grid auto-rows-[150px] grid-cols-2 gap-3 sm:auto-rows-[170px] sm:grid-cols-4 lg:auto-rows-[190px]">
      {set.map((m, k) => (
        <motion.div key={`${m.id}-${k}`} className={layout[k]} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease, delay: k * 0.05 }}>
          <Clip id={m.id} caption={m.caption} on={near} className="h-full" />
        </motion.div>
      ))}
    </div>
  )
}
