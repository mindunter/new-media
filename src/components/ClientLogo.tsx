import backops from '@/assets/logos/backops.webp'
import beacon from '@/assets/logos/beacon.webp'
import charming from '@/assets/logos/charming.webp'
import falconer from '@/assets/logos/falconer.webp'
import reactor from '@/assets/logos/reactor.webp'
import runlayer from '@/assets/logos/runlayer.webp'
import sazabi from '@/assets/logos/sazabi.webp'
import webcmd from '@/assets/logos/webcmd.webp'
import { cn } from '@/lib/utils'

/**
 * Client logos, captured from each company's own website and stored as
 * transparent images in src/assets/logos. They are drawn as a CSS mask filled with
 * the current text colour, so every logo matches the surrounding type in both
 * light and dark mode. Ratio is width / height of the trimmed artwork.
 */
const logos: Record<string, { file: string; ratio: number }> = {
  Reactor: { file: reactor, ratio: 8.703 },
  Sazabi: { file: sazabi, ratio: 6.125 },
  Runlayer: { file: runlayer, ratio: 4.525 },
  Beacon: { file: beacon, ratio: 3.49 },
  BackOps: { file: backops, ratio: 4.167 },
  Falconer: { file: falconer, ratio: 5.644 },
  Charming: { file: charming, ratio: 4.67 },
  webcmd: { file: webcmd, ratio: 5.426 },
}

type Props = {
  name: string
  /** Height of the logo; wide wordmarks are scaled down so every logo carries similar visual weight. */
  height?: number
  className?: string
}

export function ClientLogo({ name, height = 28, className }: Props) {
  const l = logos[name]
  if (!l) {
    // No verified logo yet: fall back to a clean wordmark.
    return (
      <span className={cn('font-display font-semibold tracking-[-0.03em]', className)} style={{ fontSize: height * 0.9 }}>
        {name}
      </span>
    )
  }
  // Optical sizing: very wide marks shrink, compact marks grow, so they balance in a row.
  const h = height * Math.min(1.25, Math.max(0.62, Math.sqrt(4.5 / l.ratio)))
  const url = `url(${l.file})`
  return (
    <span
      role="img"
      aria-label={name}
      className={cn('inline-block shrink-0 bg-current', className)}
      style={{
        height: h,
        width: h * l.ratio,
        WebkitMask: `${url} center / contain no-repeat`,
        mask: `${url} center / contain no-repeat`,
      }}
    />
  )
}

export const hasLogo = (name: string) => name in logos
