import backops from '@/assets/logos/backops.webp'
import beacon from '@/assets/logos/beacon.webp'
import charming from '@/assets/logos/charming.webp'
import composio from '@/assets/logos/composio.webp'
import entelligenceMark from '@/assets/logos/entelligence-mark.webp'
import entelligence from '@/assets/logos/entelligence-wordmark.svg'
import falconer from '@/assets/logos/falconer.webp'
import interact from '@/assets/logos/interact.svg'
import mem0 from '@/assets/logos/mem0.webp'
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
 *
 * A logo whose mark only works in colour (Entelligence's green tile) keeps that mark
 * as an image in front of the one-colour wordmark, as on the company's own site.
 */
export const logos: Record<string, { file: string; ratio: number; mark?: string; markScale?: number }> = {
  Reactor: { file: reactor, ratio: 8.703 },
  Sazabi: { file: sazabi, ratio: 6.125 },
  Runlayer: { file: runlayer, ratio: 4.525 },
  Beacon: { file: beacon, ratio: 3.49 },
  BackOps: { file: backops, ratio: 4.167 },
  Falconer: { file: falconer, ratio: 5.644 },
  Charming: { file: charming, ratio: 4.67 },
  webcmd: { file: webcmd, ratio: 5.426 },
  Mem0: { file: mem0, ratio: 4.025 },
  'Interact AI': { file: interact, ratio: 4.592 },
  Composio: { file: composio, ratio: 5.208 },
  // From entelligence.ai: a 34px tile beside a 15.9px wordmark.
  'Entelligence AI': { file: entelligence, ratio: 5.5, mark: entelligenceMark, markScale: 2.14 },
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
  if (l.mark) {
    const m = h * 1.4
    const w = m / (l.markScale ?? 2)
    return (
      <span role="img" aria-label={name} className={cn('inline-flex shrink-0 items-center', className)} style={{ gap: m * 0.3 }}>
        <img src={l.mark} alt="" style={{ height: m, width: m }} className="rounded-[22%]" />
        <span aria-hidden className="inline-block bg-current" style={{ height: w, width: w * l.ratio, WebkitMask: `${url} center / contain no-repeat`, mask: `${url} center / contain no-repeat` }} />
      </span>
    )
  }
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
