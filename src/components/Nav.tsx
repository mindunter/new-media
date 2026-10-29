import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from 'motion/react'
import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { brand, nav } from '@/content'
import { cn } from '@/lib/utils'
import { Button } from './Button'
import { Logo } from './Logo'
import { ThemeToggle } from './ThemeToggle'

export function Nav() {
  // The mobile menu remembers which page it was opened on, so it closes itself when the page changes.
  const { pathname } = useLocation()
  const [openOn, setOpenOn] = useState<string | null>(null)
  const open = openOn === pathname
  const setOpen = (fn: (o: boolean) => boolean) => setOpenOn(fn(open) ? pathname : null)
  const { scrollY, scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30 })
  const [hidden, setHidden] = useState(false)
  const [solid, setSolid] = useState(false)

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setHidden(y > prev && y > 400 && !open)
    setSolid(y > 40)
  })


  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4"
        animate={{ y: hidden ? '-120%' : '0%' }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <nav
          aria-label="Main"
          className={cn(
            // Floating centred pill, solid in both themes so it reads over the sky hero.
            'relative mx-auto flex h-14 max-w-[1080px] items-center justify-between rounded-full bg-base/85 pr-2 pl-5 text-fg ring-1 ring-fg/10 backdrop-blur-xl transition-shadow duration-500',
            solid || open ? 'shadow-[0_16px_40px_-16px_rgb(10_20_80/0.45)]' : 'shadow-[0_10px_30px_-18px_rgb(10_20_80/0.4)]',
          )}
        >
          <Link to="/" className="flex items-center gap-2" aria-label={`${brand.name} home`}>
            <Logo />
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {nav.map((item) => (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      'block rounded-full px-3.5 py-2 text-[0.92rem] font-medium transition-colors',
                      isActive ? 'bg-fg/[0.08] text-fg' : 'text-fg/75 hover:bg-fg/[0.06] hover:text-fg',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <div className="hidden sm:block">
              <Button href="/contact" variant="signal" burst>
                Plan your launch
              </Button>
            </div>
            <button
              type="button"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
              className={cn(
                'grid h-11 w-11 place-items-center rounded-full lg:hidden',
                'bg-fg/5',
              )}
            >
              <span className="relative block h-3 w-5">
                <span
                  className={cn(
                    'absolute left-0 h-[1.5px] w-5 bg-current transition-all duration-300',
                    open ? 'top-1.5 rotate-45' : 'top-0',
                  )}
                />
                <span
                  className={cn(
                    'absolute left-0 h-[1.5px] w-5 bg-current transition-all duration-300',
                    open ? 'top-1.5 -rotate-45' : 'top-3',
                  )}
                />
              </span>
            </button>
          </div>

          <motion.span
            aria-hidden
            className="absolute right-8 bottom-0 left-8 h-px origin-left bg-soft"
            style={{ scaleX: progress, opacity: solid ? 1 : 0 }}
          />
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col justify-end bg-deep px-6 pt-24 pb-10 text-on-deep lg:hidden"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          >
            <ul className="space-y-1">
              {nav.map((item, i) => (
                <motion.li
                  key={item.href}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link to={item.href} className="display block py-1.5 text-[clamp(2.4rem,9vw,3.4rem)]">
                    {item.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <div className="mt-10 flex items-center justify-between">
              <Button href="/contact" variant="signal">
                Plan your launch
              </Button>
              <a href={`mailto:${brand.email}`} className="text-sm text-on-deep-muted underline-offset-4 hover:underline">
                Email us
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
