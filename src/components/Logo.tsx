import { useId } from 'react'
import { cn } from '@/lib/utils'

/*
 * NEW! MEDIA identity, redrawn as SVG in the site palette.
 * Letters are drawn upright on a 100-unit cap height and slanted with one skew,
 * so the accent block under the "!" picks up the same angle as the type.
 */
const SLANT = 'translate(25 0) skewX(-14)'
const N = 'M0 100V0h24l42 62V0h24v100H66L24 38v62z'
const E = 'M102 0h70v20h-46v20h40v20h-40v20h46v20h-70z'
const W = 'M184 0h24l14 66 16-66h20l16 66 14-66h24l-26 100h-24l-14-58-14 58h-24z'
const BAR = 'M322 0h24l-6 64h-22z'
const DOT = 'M314 76h24v24h-24z'

function Accent({ id }: { id: string }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#3f4bff" />
      <stop offset="100%" stopColor="#8b45f0" />
    </linearGradient>
  )
}

type Props = { className?: string; title?: string }

/** Stacked lockup: NEW! over spaced MEDIA. */
export function LogoFull({ className, title = 'New Media' }: Props) {
  const gid = useId()
  return (
    <svg viewBox="0 0 375 152" className={cn('block', className)} role="img" aria-label={title}>
      <defs>
        <Accent id={gid} />
      </defs>
      <g transform={SLANT}>
        <path d={`${N}${E}${W}${BAR}`} fill="currentColor" />
        <path d={DOT} fill={`url(#${gid})`} />
      </g>
      <text
        x="187"
        y="148"
        textAnchor="middle"
        fill="currentColor"
        fontFamily="Inter Variable, Helvetica Neue, Arial, sans-serif"
        fontWeight="300"
        fontSize="34"
        letterSpacing="27"
      >
        MEDIA
      </text>
    </svg>
  )
}

/** Single-line lockup for the nav: NEW! wordmark with MEDIA set beside it. */
export function Logo({ className, title = 'New Media' }: Props) {
  const gid = useId()
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <svg viewBox="0 0 375 100" className="block h-[18px] w-auto sm:h-5" role="img" aria-label={title}>
        <defs>
          <Accent id={gid} />
        </defs>
        <g transform={SLANT}>
          <path d={`${N}${E}${W}${BAR}`} fill="currentColor" />
          <path d={DOT} fill={`url(#${gid})`} />
        </g>
      </svg>
      <span aria-hidden className="text-[0.7rem] font-light tracking-[0.42em] sm:text-xs">
        MEDIA
      </span>
    </span>
  )
}

/** App-icon mark: the N with the accent block, on a rounded square. */
export function LogoMark({ className }: { className?: string }) {
  const gid = useId()
  return (
    <svg viewBox="0 0 120 120" className={cn('block', className)} aria-hidden>
      <defs>
        <Accent id={gid} />
      </defs>
      <rect width="120" height="120" rx="28" fill="#0b0b1e" />
      <g transform="translate(17 30) scale(0.6)">
        <g transform={SLANT}>
          <path d={N} fill="#f4f4fb" />
          <path d="M98 76h22v24h-22z" fill={`url(#${gid})`} />
        </g>
      </g>
    </svg>
  )
}
