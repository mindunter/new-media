import { art } from '@/lib/paths'
import { cn } from '@/lib/utils'

type Props = {
  className?: string
  priority?: boolean
  /** Which part of the sky shows: 0% is open blue, 100% is the cloud bank. */
  position?: string
  /** Soft blue tint on the left, behind text, so white copy stays readable over clouds. */
  scrim?: boolean
}

/** The rendered cloud sky, day in light mode and night in dark mode. Fills its positioned parent. */
export function Sky({ className, priority = false, position = '50% 100%', scrim = false }: Props) {
  const cls = 'h-full w-full object-cover'
  return (
    <div aria-hidden className={cn('absolute inset-0 -z-20', className)}>
      <img
        src={art('sky-light.webp')}
        srcSet={`${art('sky-light-1000.webp')} 1000w, ${art('sky-light.webp')} 2000w`}
        sizes="100vw"
        alt=""
        fetchPriority={priority ? 'high' : undefined}
        loading={priority ? undefined : 'lazy'}
        style={{ objectPosition: position }}
        className={cn(cls, 'dark:hidden')}
      />
      <img
        src={art('sky-dark.webp')}
        srcSet={`${art('sky-dark-1000.webp')} 1000w, ${art('sky-dark.webp')} 2000w`}
        sizes="100vw"
        alt=""
        loading="lazy"
        style={{ objectPosition: position }}
        className={cn(cls, 'hidden dark:block')}
      />
      {scrim && (
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(8_72_190/0.6)_0%,rgb(8_72_190/0.35)_45%,transparent_72%)] max-lg:bg-[linear-gradient(180deg,rgb(8_72_190/0.35)_0%,rgb(8_72_190/0.45)_70%,transparent_100%)]" />
      )}
    </div>
  )
}
