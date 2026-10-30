import { cva, type VariantProps } from 'class-variance-authority'
import { ArrowRight } from 'lucide-react'
import type { AnchorHTMLAttributes } from 'react'
import { Link } from 'react-router'
import { burstFrom } from '@/lib/burst'
import { scrollToHash } from '@/lib/scroll'
import { cn } from '@/lib/utils'

const button = cva(
  'group inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-colors duration-200 select-none',
  {
    variants: {
      variant: {
        signal: 'bg-fill text-white hover:bg-deep dark:hover:bg-white dark:hover:text-deep',
        ink: 'bg-fg text-page hover:bg-fill hover:text-white',
        light: 'bg-white text-deep shadow-[0_10px_26px_-10px_rgb(5_40_120/0.55)] hover:bg-deep hover:text-white',
        outline: 'text-fg ring-1 ring-fg/25 ring-inset hover:bg-fg hover:text-page',
        outlineDark: 'text-on-deep ring-1 ring-on-deep/30 ring-inset hover:bg-on-deep hover:text-deep',
      },
      size: {
        md: 'h-11 px-5 text-[0.95rem]',
        lg: 'h-13 px-6 text-[1rem]',
      },
    },
    defaultVariants: { variant: 'signal', size: 'md' },
  },
)

type Props = AnchorHTMLAttributes<HTMLAnchorElement> &
  VariantProps<typeof button> & { arrow?: boolean; /** Fire an icon burst from the button on click. */ burst?: boolean }

/** Pill link. Paths like "/work" navigate between pages; "#id" scrolls within the page. */
export function Button({ className, variant, size, children, href = '#', onClick, arrow = true, burst, ...rest }: Props) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (burst) burstFrom(e.currentTarget, { count: 18 })
    if (href.startsWith('#') && href.length > 1) {
      e.preventDefault()
      scrollToHash(href)
    }
  }
  const classes = cn(button({ variant, size }), className)
  const inner = (
    <>
      {children}
      {arrow && (
        <ArrowRight
          size={17}
          strokeWidth={2.25}
          aria-hidden
          className="transition-transform duration-200 group-hover:translate-x-0.5"
        />
      )}
    </>
  )

  if (href.startsWith('/')) {
    return (
      <Link to={href} onClick={handleClick} className={classes} {...rest}>
        {inner}
      </Link>
    )
  }
  return (
    <a href={href} onClick={handleClick} className={classes} {...rest}>
      {inner}
    </a>
  )
}
