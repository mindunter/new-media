import { AnimatePresence, motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { launches } from '@/content'
import { burstFrom } from '@/lib/burst'
import { cn, compact, isFinePointer, prefersReducedMotion } from '@/lib/utils'

/**
 * A wall of media devices (TVs, a monitor, a phone, a laptop) that "play" our
 * real launches and flip channels every few seconds. Devices drift with the
 * pointer at different depths, and pressing one sets off an icon burst.
 */

function useChannel(start: number, every: number) {
  const [i, setI] = useState(start)
  useEffect(() => {
    if (prefersReducedMotion()) return
    const id = window.setInterval(() => setI((v) => (v + 1) % launches.length), every)
    return () => window.clearInterval(id)
  }, [every])
  return i
}

/** What a screen shows: one launch, with a quick static flash between channels. */
function Screen({ start, every, size = 'md' }: { start: number; every: number; size?: 'sm' | 'md' | 'lg' }) {
  const i = useChannel(start, every)
  const l = launches[i]
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[inherit] bg-[linear-gradient(180deg,#0f5fd8_0%,#2f8ff2_62%,#2f8f1f_62.5%,#2a7f1c_100%)] text-white">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={i}
          className={cn(
            'absolute inset-0 flex flex-col justify-between',
            size === 'lg' ? 'p-[7%]' : size === 'md' ? 'p-[8%]' : 'p-[10%]',
          )}
          initial={{ opacity: 0, filter: 'brightness(2.2) blur(2px)' }}
          animate={{ opacity: 1, filter: 'brightness(1) blur(0px)' }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <p
            className={cn(
              'flex items-center gap-1.5 font-semibold text-white/80',
              size === 'lg' ? 'text-[clamp(0.6rem,1vw,0.85rem)]' : 'text-[clamp(0.5rem,0.8vw,0.7rem)]',
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#ff4d6d]" /> {l.brand}
          </p>
          <div>
            <p
              className={cn(
                'serif leading-none',
                size === 'lg'
                  ? 'text-[clamp(1.8rem,4.4vw,3.6rem)]'
                  : size === 'md'
                    ? 'text-[clamp(1.2rem,2.4vw,2.2rem)]'
                    : 'text-[clamp(0.9rem,1.6vw,1.4rem)]',
              )}
            >
              {compact(l.views)}
            </p>
            <p
              className={cn(
                'mt-1 text-white/75',
                size === 'lg' ? 'text-[clamp(0.6rem,1vw,0.85rem)]' : 'line-clamp-2 text-[clamp(0.45rem,0.75vw,0.65rem)]',
              )}
            >
              views · {l.title}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
      {/* Scanlines and glass glare */}
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgb(255_255_255/0.035)_0_1px,transparent_1px_3px)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(140deg,rgb(255_255_255/0.16)_0%,transparent_35%)]" />
    </div>
  )
}

// Glossy XP/Vista plastic: a bright upper half over a saturated lower half.
const body =
  'bg-[linear-gradient(180deg,#a9dcff_0%,#4fa8f5_46%,#1a7ff0_50%,#1668e8_100%)] shadow-[0_24px_50px_-26px_rgb(5_40_120/0.7),inset_0_1px_0_rgb(255_255_255/0.8)]'

function Device({
  depth,
  x,
  y,
  className,
  children,
  label,
}: {
  depth: number
  x: MotionValue<number>
  y: MotionValue<number>
  className?: string
  children: ReactNode
  label: string
}) {
  const tx = useTransform(x, (v) => v * depth * 14)
  const ty = useTransform(y, (v) => v * depth * 10)
  return (
    <motion.button
      type="button"
      aria-label={`${label}: play a launch`}
      onClick={(e) => burstFrom(e.currentTarget, { count: 12 })}
      style={{ x: tx, y: ty }}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.97 }}
      className={cn('relative shrink-0 cursor-pointer', className)}
    >
      {children}
    </motion.button>
  )
}

export function DeviceWall({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const x = useSpring(px, { stiffness: 60, damping: 18 })
  const y = useSpring(py, { stiffness: 60, damping: 18 })

  useEffect(() => {
    if (!isFinePointer() || prefersReducedMotion()) return
    const move = (e: PointerEvent) => {
      px.set((e.clientX / window.innerWidth) * 2 - 1)
      py.set((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [px, py])

  return (
    <div
      ref={ref}
      className={cn('flex items-end justify-center gap-[clamp(6px,1.4vw,20px)] px-2', className)}
      role="group"
      aria-label="Screens showing our launches"
    >
      {/* Retro TV with antenna */}
      <Device depth={-0.8} x={x} y={y} label="Retro TV" className="hidden w-[clamp(100px,10vw,150px)] sm:block">
        <div className="absolute -top-[26%] left-1/2 h-[30%] w-[60%] -translate-x-1/2">
          <span className="absolute bottom-0 left-1/2 h-full w-[2px] origin-bottom -rotate-[28deg] bg-fg/40" />
          <span className="absolute bottom-0 left-1/2 h-full w-[2px] origin-bottom rotate-[28deg] bg-fg/40" />
        </div>
        <div className={cn('rounded-[22%] p-[9%] pb-[14%]', body)}>
          <div className="aspect-square rounded-[18%]">
            <Screen start={3} every={4300} size="sm" />
          </div>
        </div>
      </Device>

      {/* Monitor on a stand */}
      <Device depth={0.6} x={x} y={y} label="Monitor" className="w-[clamp(150px,18.5vw,270px)]">
        <div className={cn('rounded-[10px] p-[3.5%]', body)}>
          <div className="aspect-[16/10] rounded-[6px]">
            <Screen start={2} every={3900} />
          </div>
        </div>
        <div className={cn('mx-auto h-[clamp(14px,2vw,28px)] w-[14%]', body)} />
        <div className={cn('mx-auto h-[clamp(5px,0.6vw,8px)] w-[42%] rounded-full', body)} />
      </Device>

      {/* Main CRT TV */}
      <Device depth={0.2} x={x} y={y} label="TV" className="w-[clamp(220px,29vw,420px)]">
        <div className={cn('flex gap-[3%] rounded-[clamp(16px,2.4vw,30px)] p-[3.5%]', body)}>
          <div className="aspect-[4/3] flex-1 rounded-[clamp(10px,1.6vw,20px)]">
            <Screen start={0} every={3400} size="lg" />
          </div>
          <div className="flex w-[11%] flex-col items-center justify-center gap-[18%]">
            <span className="aspect-square w-full rounded-full bg-[radial-gradient(circle_at_35%_30%,#fff,#45c32e)] shadow-inner" />
            <span className="aspect-square w-[80%] rounded-full bg-[radial-gradient(circle_at_35%_30%,#fff,#45c32e)] shadow-inner" />
            <span className="mt-2 grid w-full gap-[3px]">
              {[0, 1, 2].map((k) => (
                <span key={k} className="h-[2px] w-full rounded bg-fg/25" />
              ))}
            </span>
          </div>
        </div>
        <div className="mx-auto flex w-[70%] justify-between">
          <span className={cn('h-[clamp(8px,1vw,14px)] w-[8%] rounded-b', body)} />
          <span className={cn('h-[clamp(8px,1vw,14px)] w-[8%] rounded-b', body)} />
        </div>
      </Device>

      {/* Phone */}
      <Device depth={1} x={x} y={y} label="Phone" className="w-[clamp(80px,8.8vw,128px)]">
        <div className="rounded-[22%/11%] bg-[#0b0f28] p-[6%] shadow-[0_30px_60px_-30px_rgb(10_20_80/0.7)] ring-1 ring-white/10">
          <div className="relative aspect-[9/19] rounded-[18%/8.5%]">
            <Screen start={7} every={3600} size="sm" />
            <span className="absolute top-[3%] left-1/2 h-[3%] w-[30%] -translate-x-1/2 rounded-full bg-black" />
          </div>
        </div>
      </Device>

      {/* Laptop */}
      <Device depth={-0.4} x={x} y={y} label="Laptop" className="hidden w-[clamp(170px,19vw,280px)] md:block">
        <div className="mx-auto w-[86%] rounded-t-[10px] bg-[#0b0f28] p-[3%] pb-[2%] ring-1 ring-white/10">
          <div className="aspect-[16/10] rounded-[4px]">
            <Screen start={4} every={4100} />
          </div>
        </div>
        <div className={cn('h-[clamp(8px,1vw,14px)] rounded-b-[14px] rounded-t-[2px]', body)} />
      </Device>
    </div>
  )
}
