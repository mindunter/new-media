import { cva, type VariantProps } from 'class-variance-authority'
import { ArrowRight } from 'lucide-react'
import type { AnchorHTMLAttributes } from 'react'
import { burstFrom } from '@/lib/burst'
import { scrollToHash } from '@/lib/scroll'
import { cn } from '@/lib/utils'

const button = cva(
  'group inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-colors duration-200 select-none',
  {
    variants: {
      variant: {
        signal:
          'bg-grad text-white shadow-[0_8px_24px_-10px_rgb(60_70_240/0.7)] transition-[filter,box-shadow] hover:brightness-110 hover:shadow-[0_12px_30px_-10px_rgb(110_70_240/0.8)]',
        ink: 'bg-fg text-base hover:bg-fill hover:text-white',
        light: 'bg-white text-deep shadow-[0_10px_30px_-12px_rgb(10_20_80/0.6)] hover:bg-[#eef1ff]',
        outline: 'text-fg ring-1 ring-fg/25 ring-inset hover:bg-fg hover:text-base',
        outlineDark: 'text-on-deep ring-1 ring-on-deep/30 ring-inset hover:bg-on-deep hover:text-deep',
      },
      size: {
        md: 'h-11 px-5 text-[0.95rem]',
        lg: 'h-13 px-6 text-base',
      },
    },
    defaultVariants: { variant: 'signal', size: 'md' },
  },
)

type Props = AnchorHTMLAttributes<HTMLAnchorElement> &
  VariantProps<typeof button> & { arrow?: boolean; /** Fire an icon burst from the button on click. */ burst?: boolean }

/** Pill link. In-page hash links scroll smoothly. */
export function Button({ className, variant, size, children, href = '#', onClick, arrow = true, burst, ...rest }: Props) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (burst) burstFrom(e.currentTarget, { count: 18 })
    if (href.startsWith('#') && href.length > 1) {
      e.preventDefault()
      scrollToHash(href)
    }
  }

  return (
    <a href={href} onClick={handleClick} className={cn(button({ variant, size }), className)} {...rest}>
      {children}
      {arrow && (
        <ArrowRight
          size={17}
          strokeWidth={2.25}
          aria-hidden
          className="transition-transform duration-200 group-hover:translate-x-0.5"
        />
      )}
    </a>
  )
}
