import { motion, useInView } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { cta, memes } from '@/content'
import { cn, prefersReducedMotion } from '@/lib/utils'
import { Button } from './Button'
import { Reveal } from './Reveal'

const gif = (id: string, still = false) => `https://media.giphy.com/media/${id}/${still ? '200_s.gif' : '200.webp'}`

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

function Tile({ meme, active, still, className }: { meme: (typeof memes)[number]; active: boolean; still: boolean; className: string }) {
  // Two stacked images, so the old meme stays visible until the new one has loaded and faded in.
  const [{ shown, prev }, setPair] = useState({ shown: meme, prev: meme })

  useEffect(() => {
    const img = new Image()
    let live = true
    const swap = () => {
      if (live) setPair((p) => (p.shown.id === meme.id ? p : { shown: meme, prev: p.shown }))
    }
    img.onload = swap
    img.onerror = swap
    img.src = gif(meme.id, still)
    return () => {
      live = false
    }
  }, [meme, still])

  return (
    <figure className={cn('relative overflow-hidden bg-deep-2', className)}>
      <img src={gif(prev.id, still)} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      <motion.img
        key={shown.id}
        src={gif(shown.id, still)}
        alt=""
        initial={{ opacity: prev.id === shown.id ? 1 : 0, scale: prev.id === shown.id ? 1 : 1.06 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="absolute inset-0 h-full w-full object-cover"
      />
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
  const [still] = useState(() => prefersReducedMotion())
  const [slots, setSlots] = useState(() => tiles.map((_, i) => i))
  const [step, setStep] = useState(0)
  const next = useRef(tiles.length)

  useEffect(() => {
    if (!inView || still) return
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
    }, 1100)
    return () => window.clearInterval(id)
  }, [inView, still])

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
            <Tile key={i} meme={memes[slots[i]]} active={inView && !still && t.order === activeOrder} still={still} className={t.span} />
          ))}
        </div>
        <p className="mt-3 text-right text-xs text-muted">
          GIFs via{' '}
          <a href="https://giphy.com" target="_blank" rel="noreferrer" className="underline underline-offset-2">
            GIPHY
          </a>
          . Captions by New Media.
        </p>
      </div>
    </section>
  )
}
