import { motion, useInView } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { cta, memes } from '@/content'
import { art } from '@/lib/paths'
import { cn, prefersReducedMotion } from '@/lib/utils'
import { Button } from './Button'
import { Reveal } from './Reveal'

const still = (id: string) => art(`memes/${id}.webp`)
const clip = (id: string) => art(`memes/${id}.mp4`)
/** The single-file preview embeds only the stills, so it shows those and skips the videos. */
const hasVideo = () => !(window as unknown as { __NM_ART__?: unknown }).__NM_ART__

/**
 * Collage layout. Tiles touch so the wall reads as one connected feed, and `order`
 * walks between neighbours, so each swap visibly passes along to the tile next to it.
 */
const tiles = [
  { span: 'col-span-2 row-span-2 lg:col-start-1 lg:row-start-1', order: 0 },
  { span: 'col-span-2 lg:col-span-1 lg:col-start-3 lg:row-start-1', order: 1 },
  { span: 'col-span-2 lg:col-span-1 lg:col-start-4 lg:row-start-1', order: 2 },
  { span: 'col-span-2 lg:col-start-5 lg:row-start-1', order: 3 },
  { span: 'lg:col-start-3 lg:row-start-2 lg:row-span-2', order: 8 },
  { span: 'lg:col-start-4 lg:row-start-2', order: 6 },
  { span: 'lg:col-start-5 lg:row-start-2', order: 5 },
  { span: 'lg:col-start-6 lg:row-start-2 lg:row-span-2', order: 4 },
  { span: 'lg:col-span-2 lg:col-start-1 lg:row-start-3', order: 9 },
  { span: 'lg:col-span-2 lg:col-start-4 lg:row-start-3', order: 7 },
]

function Tile({ meme, active, motionOn, near, playing, className }: { meme: (typeof memes)[number]; active: boolean; motionOn: boolean; near: boolean; playing: boolean; className: string }) {
  // Stills sit underneath and appear at once. The video fades in over them when it can play, so a tile is never blank.
  const [{ shown, prev }, setPair] = useState({ shown: meme, prev: meme })
  const [ready, setReady] = useState(false)
  const video = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const img = new Image()
    let live = true
    const swap = () => {
      if (!live) return
      setPair((p) => {
        if (p.shown.id === meme.id) return p
        setReady(false)
        return { shown: meme, prev: p.shown }
      })
    }
    img.onload = swap
    img.onerror = swap
    img.src = still(meme.id)
    return () => {
      live = false
    }
  }, [meme])

  // Only decode while the wall is on screen. Autoplay can be refused (low power mode), which leaves the still.
  useEffect(() => {
    const v = video.current
    if (!v) return
    if (playing) v.play().catch(() => {})
    else v.pause()
  }, [playing, shown.id, near])

  return (
    <figure className={cn('relative overflow-hidden bg-deep-2', className)}>
      <img src={still(prev.id)} alt="" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
      <motion.img
        key={shown.id}
        src={still(shown.id)}
        alt=""
        decoding="async"
        initial={{ opacity: prev.id === shown.id ? 1 : 0, scale: prev.id === shown.id ? 1 : 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 h-full w-full object-cover"
      />
      {motionOn && near && (
        <video
          key={`v-${shown.id}`}
          ref={video}
          src={clip(shown.id)}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          onPlaying={() => setReady(true)}
          className={cn('absolute inset-0 h-full w-full object-cover transition-opacity duration-300', ready ? 'opacity-100' : 'opacity-0')}
        />
      )}
      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent px-2.5 pt-8 pb-2 text-xs leading-tight font-semibold text-white sm:px-3 sm:text-sm">
        {shown.caption}
      </figcaption>
      <span aria-hidden className={cn('pointer-events-none absolute inset-0 ring-3 ring-fill ring-inset transition-opacity duration-500', active ? 'opacity-100' : 'opacity-0')} />
    </figure>
  )
}

/** A wall of memes, always changing, the way the feed your buyers read is always changing. */
export function Memes() {
  const wall = useRef<HTMLDivElement>(null)
  const inView = useInView(wall, { margin: '100px' })
  // Videos start downloading a little before the wall scrolls into view, and only then.
  const near = useInView(wall, { margin: '500px', once: true })
  const [reduced] = useState(() => prefersReducedMotion())
  const [motionOn] = useState(() => !reduced && hasVideo())
  const [slots, setSlots] = useState(() => tiles.map((_, i) => i))
  const [step, setStep] = useState(0)
  const next = useRef(tiles.length)

  useEffect(() => {
    if (!inView || reduced) return
    const id = window.setInterval(() => {
      setStep((s) => {
        const n = s + 1
        const tile = tiles.findIndex((t) => t.order === n % tiles.length)
        setSlots((cur) => {
          const copy = [...cur]
          // Take the next meme not already on the wall.
          let m = next.current % memes.length
          while (copy.includes(m)) m = (m + 1) % memes.length
          next.current = m + 1
          copy[tile] = m
          return copy
        })
        return n
      })
    }, 1400)
    return () => window.clearInterval(id)
  }, [inView, reduced])

  const activeOrder = step % tiles.length

  return (
    <section aria-labelledby="memes-title" className="bg-page py-20 sm:py-28">
      <div className="shell">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <p className="label-pill mb-4">Meme speed</p>
            <h2 id="memes-title" className="display max-w-4xl text-[clamp(2.2rem,4.8vw,4.4rem)]">
              Marketing now moves at the speed of <span className="serif italic">the meme.</span>
            </h2>
            <p className="mt-4 max-w-xl text-[1.05rem] text-muted">
              The feed changes every second. Your launch has to land inside it, in the words people already use. That is the part we run.
            </p>
          </Reveal>
          <Button href={cta.href} size="lg">
            {cta.label}
          </Button>
        </div>

        <div ref={wall} className="grid grid-flow-dense auto-rows-[clamp(112px,16vw,220px)] grid-cols-2 gap-[3px] overflow-hidden rounded-3xl bg-fill p-[3px] md:grid-cols-4 lg:grid-cols-6" aria-hidden>
          {tiles.map((t, i) => (
            <Tile key={i} meme={memes[slots[i]]} active={inView && !reduced && t.order === activeOrder} motionOn={motionOn} near={near} playing={inView} className={t.span} />
          ))}
        </div>
        <p className="mt-3 text-right text-xs text-muted">
          Memes sourced from{' '}
          <a href="https://giphy.com" target="_blank" rel="noreferrer" className="underline underline-offset-2">
            GIPHY
          </a>
          . Captions by New Media.
        </p>
      </div>
    </section>
  )
}
