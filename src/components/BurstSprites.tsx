import { devices, PlatformIcon, platforms } from '@/lib/icons'

const tile =
  'grid h-full w-full place-items-center rounded-[28%] border border-fg/10 bg-page shadow-[0_8px_24px_-8px_rgb(10_10_40/0.35)]'

/**
 * Hidden templates that the burst engine clones. Rendered once so the icons
 * pick up the current theme colors through CSS variables.
 */
export function BurstSprites() {
  return (
    <div hidden aria-hidden>
      {platforms.map((p) => (
        <div key={p.id} data-sprite={p.id} className={tile}>
          <span className="h-[60%] w-[60%] text-fg [&>svg]:h-full [&>svg]:w-full">
            <PlatformIcon p={p} />
          </span>
        </div>
      ))}
      {devices.map((d, i) => (
        <div key={d.id} data-sprite={d.id} className={tile}>
          <span
            className={`h-[58%] w-[58%] [&>svg]:h-full [&>svg]:w-full ${i % 2 ? 'text-accent-2' : 'text-accent'}`}
          >
            {d.icon}
          </span>
        </div>
      ))}
    </div>
  )
}
