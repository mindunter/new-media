import { AnimatePresence, motion, useInView } from 'motion/react'
import { ArrowUpRight, Bookmark, Heart, MessageCircle, Repeat2, X as Close } from 'lucide-react'
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router'
import { BookingCalendar } from '@/components/BookingCalendar'
import { Button } from '@/components/Button'
import { ClientLogo } from '@/components/ClientLogo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { backing, brand, fundingTotal, logoRow, postUrl, posts, totalViews, type Post } from '@/content'
import { art } from '@/lib/paths'
import { cn, compact, prefersReducedMotion } from '@/lib/utils'
import { MiniBars } from './charts'
import { ago, useLaunchFeed, useNow } from './feed'

export const ease = [0.16, 1, 0.3, 1] as const
export const byViews = [...posts].sort((a, b) => b.views - a.views)
export const byDate = [...posts].sort((a, b) => b.date.localeCompare(a.date))
export const companies = new Set(posts.map((p) => p.brand)).size
const firms = ['Lightspeed', 'Khosla Ventures', 'Insight Partners', 'Felicis', 'Y Combinator', 'Amplify Partners', 'South Park Commons', 'Village Global']
const when = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })
export const millions = (n: number) => `${(Math.floor(n / 100_000) / 10).toFixed(1)}M+`

/** All shared copy. Short, direct, current. */
export const copy = {
  hero: 'Launch amplification on X for AI companies.',
  sub: 'Launch-day distribution through the founder, engineer and creator graph your buyers already follow. Orchestrated in hour one. Measured to the impression.',
  steps: [
    { n: 'T−14d', title: 'Brief', body: 'Narrative, proof points and ICP compressed into one launch spec, with the accounts that move your buyers mapped against it.' },
    { n: 'T−7d', title: 'Seed', body: 'Early access for a vetted graph of operators, so every post on launch day is first-hand, not a repost of a press release.' },
    { n: 'T+1h', title: 'Launch', body: 'Quote posts, replies and native posts land inside the first-hour ranking window, when distribution compounds.' },
    { n: 'T+30d', title: 'Report', body: '30 days of follow-on coverage, then impression-level attribution by account and by post.' },
  ],
  deliverables: [
    { k: 'Launch spec', v: 'Narrative, demo cut, ICP map' },
    { k: 'Operator graph', v: 'Seeded, briefed, scheduled' },
    { k: 'Hour-one execution', v: 'Coordinated native posts' },
    { k: 'Follow-on', v: '30 days of coverage' },
    { k: 'Attribution', v: 'By account and by post' },
  ],
  faqs: [
    { q: 'Which platforms?', a: 'X first. LinkedIn on request.' },
    { q: 'How much lead time?', a: 'Two weeks is ideal. Five days is possible.' },
    { q: 'Are posts disclosed?', a: 'Yes. Paid posts are disclosed in line with platform rules and FTC guidance.' },
    { q: 'How are results reported?', a: 'A live view during launch week, then a full report by account and post.' },
    { q: 'Who do you work with?', a: 'AI and technology companies, from seed to late stage.' },
  ],
}

/* ---------------------------- small parts ---------------------------- */

export const XLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

/**
 * PLACEHOLDER wordmark. The name and identity are on hold until the new name is final,
 * so this stays deliberately plain: the name in Geist and a small square.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span aria-hidden className="size-2.5 rounded-[3px] bg-current" />
      <span className="num text-[1.02rem] font-semibold tracking-[-0.04em] lowercase">{brand.name}</span>
    </span>
  )
}

/** Image props for a NASA photo in public/art/space, at two widths. */
export function space(name: string) {
  const single = !!(window as unknown as { __NM_ART__?: unknown }).__NM_ART__
  const small = art(`space/${name}-1200.webp`)
  // The single-file preview embeds images as data URIs, which cannot sit in a srcset.
  return single ? { src: small } : { src: small, srcSet: `${small} 1200w, ${art(`space/${name}-2400.webp`)} 2400w`, sizes: '100vw' }
}

/** Moves the card's spotlight (see .spot in index.css) with the pointer. */
export const spotlight = (e: React.PointerEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
}

/** Counts up to `to` once it scrolls into view. */
export function Count({ to, format }: { to: number; format: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const seen = useInView(ref, { once: true, margin: '-10% 0px' })
  const [n, setN] = useState(() => (prefersReducedMotion() ? to : 0))
  useEffect(() => {
    if (!seen || prefersReducedMotion()) return
    let raf = 0
    const t0 = performance.now()
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / 1600)
      setN(to * (1 - Math.pow(1 - k, 4)))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [seen, to])
  return <span ref={ref}>{format(n)}</span>
}

function Avatar({ p }: { p: Post }) {
  if (p.avatar === false) {
    return (
      <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-fg/10 text-sm font-semibold">
        {p.name[0]}
      </span>
    )
  }
  return <img src={art(`x/av-${p.handle}.webp`)} alt="" width={36} height={36} loading="lazy" className="size-9 shrink-0 rounded-full bg-fg/10 object-cover" />
}

/** Section heading: a small label, the title, and an optional one-line note. All left-aligned on the grid. */
export function Heading({ id, children, note, label }: { id: string; children: React.ReactNode; note?: string; label?: string }) {
  return (
    <div>
      {label && <p className="mono-label mb-3">{label}</p>}
      <h2 id={id} className="display text-[clamp(1.55rem,2.4vw,2.1rem)] tracking-[-0.03em]">
        {children}
      </h2>
      {note && <p className="mt-2 max-w-xl text-[0.95rem] text-muted text-pretty">{note}</p>}
    </div>
  )
}

/** A text link with an arrow, for "see all" style moves between pages. */
export function More({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="group inline-flex items-center gap-1 text-[0.92rem] font-semibold whitespace-nowrap">
      {children}
      <ArrowUpRight size={16} aria-hidden className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </Link>
  )
}

/** One header row used by every section: heading on the left, an action on the right, same baseline. */
export function SectionHead({ id, label, title, note, action }: { id: string; label?: string; title: React.ReactNode; note?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
      <Heading id={id} label={label} note={note}>
        {title}
      </Heading>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

/* ------------------------------ dialogs ------------------------------ */

type Dialog = 'launch' | 'signin' | null
const DialogCtx = createContext<(d: Dialog) => void>(() => {})
export const useDialog = () => useContext(DialogCtx)

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  useEffect(() => {
    if (!open) return
    const key = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', key)
    document.documentElement.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', key)
      document.documentElement.style.overflow = ''
    }
  }, [open, onClose])
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[100] grid place-items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm" />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.35, ease }}
            data-lenis-prevent
            className="relative max-h-[92svh] w-full max-w-lg overflow-y-auto rounded-3xl border border-line bg-page p-6 shadow-2xl sm:p-8"
          >
            <button type="button" onClick={onClose} aria-label="Close" className="absolute top-4 right-4 grid size-9 place-items-center rounded-full text-muted hover:bg-fg/10 hover:text-fg">
              <Close size={18} />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Holds the Create launch and Sign in dialogs so any button on the site can open them. */
export function Dialogs({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<Dialog>(null)
  const close = useCallback(() => setOpen(null), [])
  return (
    <DialogCtx.Provider value={setOpen}>
      {children}
      <Sheet open={open === 'launch'} onClose={close} title="Create a launch">
        <p className="mono-label">Create launch</p>
        <h2 className="display mt-3 text-[1.6rem] tracking-[-0.03em]">Book your launch slot</h2>
        <p className="mt-2 text-[0.95rem] text-muted">30 minutes. Pick a time, bring your date.</p>
        <div className="mt-6">
          <BookPanel compact />
        </div>
      </Sheet>
      <Sheet open={open === 'signin'} onClose={close} title="Sign in">
        <p className="mono-label">Sign in</p>
        <h2 className="display mt-3 text-[1.6rem] tracking-[-0.03em]">Connect your X account</h2>
        <p className="mt-2 text-[0.95rem] text-muted">Track your launches and see live reach in one view.</p>
        {brand.xAuthUrl ? (
          <a href={brand.xAuthUrl} className="mt-7 flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-fg font-semibold text-page transition-opacity hover:opacity-85">
            <XLogo className="size-4" /> Continue with X
          </a>
        ) : (
          <>
            <button type="button" disabled className="mt-7 flex h-12 w-full cursor-not-allowed items-center justify-center gap-2.5 rounded-full bg-fg/80 font-semibold text-page opacity-60">
              <XLogo className="size-4" /> Continue with X
            </button>
            <p className="mt-3 text-center text-[0.8rem] text-muted">Sign-in opens soon. Until then, book a call to start a launch.</p>
          </>
        )}
      </Sheet>
    </DialogCtx.Provider>
  )
}

/* ------------------------------ frame ------------------------------ */

const links = [
  { to: '/work', label: 'Launches' },
  { to: '/live', label: 'Directory', live: true },
  { to: '/process', label: 'Process' },
]

/** Sits light over each page's photograph, then turns solid once the page scrolls. */
export function TopBar() {
  const open = useDialog()
  const [solid, setSolid] = useState(false)
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 40)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <header className={cn('fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300', solid ? 'border-line bg-page/80 text-fg backdrop-blur-xl' : 'border-transparent text-white')}>
      <nav aria-label="Main" className="shell grid h-16 grid-cols-[1fr_auto] items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
        <Link to="/" aria-label={`${brand.name}, home`} className="justify-self-start">
          <Wordmark />
        </Link>
        <ul className="hidden items-center gap-1 rounded-full border border-current/15 p-1 md:flex">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                className={({ isActive }) => cn('flex h-8 items-center gap-2 rounded-full px-3.5 text-[0.86rem] font-medium transition-colors', isActive ? 'bg-current/12 opacity-100' : 'opacity-70 hover:opacity-100')}
              >
                {l.live && <span aria-hidden className="live-dot !size-1.5" />}
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-1.5 justify-self-end">
          <ThemeToggle className="size-9 max-sm:hidden" />
          <button type="button" onClick={() => open('signin')} className="flex h-9 items-center gap-2 rounded-full px-3 text-[0.86rem] font-medium opacity-80 transition-opacity hover:opacity-100">
            <XLogo className="size-3.5" />
            <span className="max-sm:hidden">Sign in</span>
          </button>
          <button
            type="button"
            onClick={() => open('launch')}
            className={cn('flex h-9 items-center gap-1.5 rounded-full px-4 text-[0.86rem] font-semibold transition-colors', solid ? 'bg-fg text-page hover:bg-fill hover:text-white' : 'bg-white text-black hover:bg-fill hover:text-white')}
          >
            Create launch
          </button>
        </div>
      </nav>
      {/* Phone: the page links sit in a second row. */}
      <ul className="shell flex h-10 items-center gap-6 text-[0.86rem] md:hidden">
        {links.map((l) => (
          <li key={l.to}>
            <NavLink to={l.to} className={({ isActive }) => cn('flex items-center gap-1.5 font-medium', isActive ? 'opacity-100' : 'opacity-65')}>
              {l.live && <span aria-hidden className="live-dot !size-1.5" />}
              {l.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </header>
  )
}

export function Footer() {
  const open = useDialog()
  const x = brand.socials.find((s) => s.label === 'X')
  const col = 'flex flex-col gap-3 text-[0.9rem]'
  return (
    <footer className="border-t border-line">
      <div className="shell grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div className="flex flex-col items-start gap-5">
          <Wordmark />
          <p className="max-w-xs text-[0.9rem] text-muted">{copy.hero}</p>
          <button type="button" onClick={() => open('launch')} className="h-10 rounded-full bg-fg px-4 text-[0.88rem] font-semibold text-page transition-colors hover:bg-fill hover:text-white">
            Create launch
          </button>
        </div>
        <div className={col}>
          <p className="mono-label mb-1">Site</p>
          {[{ to: '/', label: 'Home' }, ...links].map((l) => (
            <Link key={l.to} to={l.to} className="w-fit hover:text-accent">
              {l.label}
            </Link>
          ))}
        </div>
        <div className={col}>
          <p className="mono-label mb-1">Work with us</p>
          <Link to="/contact" className="w-fit hover:text-accent">
            Book a call
          </Link>
          <button type="button" onClick={() => open('signin')} className="w-fit text-left hover:text-accent">
            Sign in
          </button>
        </div>
        <div className={col}>
          <p className="mono-label mb-1">Contact</p>
          {x && (
            <a href={x.href} target="_blank" rel="noreferrer" className="flex w-fit items-center gap-2 hover:text-accent">
              <XLogo className="size-3.5" /> @newmediahq
            </a>
          )}
          <a href={`mailto:${brand.email}`} className="w-fit hover:text-accent">
            {brand.email}
          </a>
        </div>
      </div>
      <div className="shell flex flex-wrap items-center justify-between gap-3 border-t border-line py-5 text-[0.75rem] text-muted">
        <span>
          © {new Date().getFullYear()} {brand.name}
        </span>
        <span>Photography: NASA, Apollo 8 and 11 (1968 to 1969). Public domain. No endorsement by NASA implied.</span>
      </div>
    </footer>
  )
}

/* ------------------------------ heroes ------------------------------ */

type HeroProps = {
  img: string
  caption: string
  title: React.ReactNode
  sub?: React.ReactNode
  label?: React.ReactNode
  children?: React.ReactNode
  /** split: photo right, words left. full: photo behind centred words. center: the photo framed below centred words. */
  layout?: 'split' | 'full' | 'center'
  pos?: string
  tall?: boolean
  foot?: React.ReactNode
  /** Darken a busy photo further so the words stay readable. */
  dim?: boolean
}

// Fades the centred photo out at the sides and the bottom, so it has no visible edge.
const heroMask = 'linear-gradient(90deg, transparent 0%, #000 24%, #000 76%, transparent 100%), linear-gradient(180deg, transparent 0%, #000 8%, #000 62%, transparent 100%)'

/** Every page opens on a photograph from the Apollo programme. */
export function PageHero({ img, caption, title, sub, label, children, layout = 'split', pos = '50% 50%', tall, foot, dim }: HeroProps) {
  const full = layout === 'full'
  const center = layout === 'center'
  const words = (
    <div className={cn(full || center ? 'flex flex-col items-center text-center' : 'max-w-[36rem]')}>
      {label && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.2 }} className="mono-label mb-5 flex items-center gap-2 !text-white/70">
          {label}
        </motion.div>
      )}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease, delay: 0.15 }}
        className={cn('display text-[clamp(2rem,4vw,3.25rem)] leading-[1.06] tracking-[-0.04em] text-balance', center ? 'max-w-[18ch]' : 'max-w-[22ch]')}
      >
        {title}
      </motion.h1>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease, delay: 0.35 }} className={cn((full || center) && 'flex flex-col items-center')}>
        {sub && <p className="mt-5 max-w-[34rem] text-[0.98rem] leading-relaxed text-pretty text-white/70 sm:text-[1.04rem]">{sub}</p>}
        {children && <div className={cn('mt-8 flex flex-wrap items-center gap-3', (full || center) && 'justify-center')}>{children}</div>}
      </motion.div>
    </div>
  )

  if (center) {
    // The photo's sky is black, so it sits in the lower half and fades into the page on all sides.
    return (
      <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-black text-white">
        <motion.img
          {...space(img)}
          alt=""
          fetchPriority="high"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2.4, ease }}
          style={{ objectPosition: pos, maskImage: heroMask, WebkitMaskImage: heroMask, maskComposite: 'intersect', WebkitMaskComposite: 'source-in' }}
          className="absolute bottom-[-6%] left-1/2 -z-10 aspect-square h-[58%] max-w-none -translate-x-1/2 object-cover max-sm:bottom-[-2%] max-sm:h-[46%]"
        />
        <div className="shell flex w-full flex-1 flex-col items-center pt-32 sm:pt-36">{words}</div>
        {foot}
        <p className="shell w-full pb-5 text-center text-[0.7rem] tracking-wide text-white/45 sm:text-right">{caption}</p>
      </section>
    )
  }

  return (
    <section className={cn('relative isolate flex flex-col overflow-hidden bg-black text-white', tall ? 'min-h-[100svh]' : 'min-h-[78svh]')}>
      <motion.img
        {...space(img)}
        alt=""
        fetchPriority="high"
        initial={{ opacity: 0, scale: 1.06 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.2, ease }}
        style={{ objectPosition: pos }}
        className={cn('absolute -z-20 h-full object-cover', full ? 'inset-0 w-full' : 'inset-x-0 top-0 w-full max-lg:h-[62%] lg:inset-y-0 lg:right-0 lg:left-auto lg:w-[64%]')}
      />
      <div
        aria-hidden
        className={cn(
          'absolute inset-0 -z-10',
          dim && 'bg-black/40',
          full
            ? 'bg-[radial-gradient(60%_45%_at_50%_50%,rgb(0_0_0/0.35),transparent_100%),linear-gradient(180deg,rgb(0_0_0/0.55)_0%,rgb(0_0_0/0.2)_40%,rgb(0_0_0/0.85)_100%)]'
            : 'bg-[linear-gradient(180deg,rgb(0_0_0/0.35)_0%,transparent_25%,rgb(0_0_0/0.6)_48%,#000_64%)] lg:bg-[linear-gradient(90deg,#000_36%,rgb(0_0_0/0.55)_52%,transparent_78%),linear-gradient(180deg,rgb(0_0_0/0.5)_0%,transparent_22%,transparent_70%,rgb(0_0_0/0.8)_100%)]',
        )}
      />
      <div className={cn('shell flex w-full flex-1 flex-col pt-36 pb-12 md:pt-32', full ? 'items-center justify-center' : 'justify-end max-lg:pt-[48svh]')}>{words}</div>
      {foot}
      <p className="shell w-full pb-5 text-right text-[0.7rem] tracking-wide text-white/45">{caption}</p>
    </section>
  )
}

/* ------------------------------ live strip ------------------------------ */

/** The newest launches from the live feed, running right to left under the hero. */
export function LiveTicker() {
  const { items } = useLaunchFeed()
  const now = useNow()
  const list = items.slice(0, 14)
  const row = (hidden?: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {list.map((it) => (
        <li key={it.id} className="flex shrink-0 items-center gap-2.5 px-6 text-[0.84rem]">
          <span className="num text-muted">{ago(it.created, now)}</span>
          <a href={it.url} target="_blank" rel="noreferrer" tabIndex={hidden ? -1 : undefined} className="max-w-[22rem] truncate font-medium hover:text-accent">
            {it.title}
          </a>
          <span aria-hidden className="ml-4 size-1 rounded-full bg-fg/25" />
        </li>
      ))}
    </ul>
  )
  return (
    <section aria-label="Launching now" className="border-b border-line">
      <div className="shell flex h-12 items-center gap-5">
        <Link to="/live" className="flex shrink-0 items-center gap-2 text-[0.8rem] font-semibold tracking-wide uppercase">
          <span aria-hidden className="live-dot" /> Live
        </Link>
        <div className="ticker logo-flow flex min-w-0 flex-1 overflow-hidden">
          {list.length ? (
            <ul className="flex w-max shrink-0">
              <li>{row()}</li>
              <li>{row(true)}</li>
            </ul>
          ) : (
            <span className="shimmer h-3 w-2/3 rounded-full" />
          )}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------ sections ------------------------------ */

export function LogoFlow({ className }: { className?: string }) {
  const row = (hidden?: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {logoRow.map((n) => (
        <li key={n} className="flex h-12 shrink-0 items-center px-7 opacity-55 transition-opacity hover:opacity-100 sm:px-10">
          <ClientLogo name={n} height={22} />
        </li>
      ))}
    </ul>
  )
  return (
    <div aria-label="Clients" role="group" className={cn('logo-flow flex overflow-hidden', className)}>
      <ul className="flex w-max shrink-0">
        <li>{row()}</li>
        <li>{row(true)}</li>
      </ul>
    </div>
  )
}

/** Four figures, each with the data behind it drawn underneath. */
export function Figures() {
  const months = [...new Set(byDate.map((p) => p.date.slice(0, 7)))].sort()
  const perBrand = [...new Set(posts.map((p) => p.brand))].map((b) => ({ b, n: posts.filter((p) => p.brand === b).length })).sort((a, b) => b.n - a.n)
  const items = [
    { v: totalViews, f: millions, k: 'Views on X', bars: byViews.map((p) => p.views), labels: byViews.map((p) => p.brand), fmt: (n: number) => compact(n) },
    { v: fundingTotal, f: (n: number) => `$${n.toFixed(1)}M+`, k: 'Funding announced', bars: backing.map((b) => b.amount), labels: backing.map((b) => b.client), fmt: (n: number) => `$${n}M` },
    {
      v: posts.length,
      f: (n: number) => `${Math.round(n)}`,
      k: 'Launches',
      bars: months.map((m) => posts.filter((p) => p.date.startsWith(m)).length),
      labels: months.map((m) => new Date(`${m}-15`).toLocaleDateString('en', { month: 'short', year: '2-digit' })),
      fmt: (n: number) => `${n}`,
    },
    { v: companies, f: (n: number) => `${Math.round(n)}`, k: 'AI companies', bars: perBrand.map((x) => x.n), labels: perBrand.map((x) => x.b), fmt: (n: number) => `${n} launch${n > 1 ? 'es' : ''}` },
  ]
  return (
    <section aria-label="Results" className="border-b border-line">
      <dl className="shell grid grid-cols-2 lg:grid-cols-4">
        {items.map((s, k) => (
          <div key={s.k} className={cn('flex flex-col border-line py-8', k % 2 === 1 ? 'border-l pl-5 sm:pl-8' : 'pr-5 sm:pr-8', k >= 2 && 'max-lg:border-t', k === 2 && 'lg:border-l lg:pl-8')}>
            <dt className="order-2 mt-2 text-[0.84rem] text-muted">{s.k}</dt>
            <dd className="num order-1 text-[clamp(1.6rem,2.6vw,2.2rem)] leading-none font-medium">
              <Count to={s.v} format={s.f} />
            </dd>
            <MiniBars className="order-3 mt-6" values={s.bars} labels={s.labels} format={s.fmt} />
          </div>
        ))}
      </dl>
    </section>
  )
}

/** One launch post, drawn like the post on X. Fixed rhythm so every card in a row lines up. */
export function PostCard({ p }: { p: Post }) {
  return (
    <a
      href={postUrl(p)}
      target="_blank"
      rel="noreferrer"
      onPointerMove={spotlight}
      aria-label={`${p.brand}, ${p.title}: ${compact(p.views)} views. Opens the post on X.`}
      className="spot group flex h-full flex-col rounded-2xl border border-line bg-surface p-5 transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-fg/30"
    >
      <div className="flex items-center gap-3">
        <Avatar p={p} />
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-[0.92rem] font-semibold">{p.name}</p>
          <p className="truncate text-[0.8rem] text-muted">
            @{p.handle} · <span className="num">{when(p.date)}</span>
          </p>
        </div>
        <XLogo className="size-4 shrink-0 text-muted transition-colors group-hover:text-fg" />
      </div>
      <p className="mt-4 line-clamp-3 min-h-[4.35em] text-[0.92rem] leading-[1.45] text-fg/90">{p.text.replace(/\s*\n+\s*/g, ' ')}</p>
      <div className="mt-4 aspect-video overflow-hidden rounded-xl border border-line bg-fg/5">
        {p.poster !== false ? (
          <img src={art(`x/p-${p.id}.webp`)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
        ) : (
          <div className="grid h-full place-items-center text-fg/70">
            <ClientLogo name={p.brand} height={30} />
          </div>
        )}
      </div>
      <div className="mt-auto flex items-end justify-between pt-5">
        <p className="leading-none">
          <span className="num text-[1.45rem] font-medium">{compact(p.views)}</span>
          <span className="ml-1.5 text-[0.8rem] text-muted">views</span>
        </p>
        <span className="flex h-6 items-center text-fg/70">
          <ClientLogo name={p.brand} height={15} />
        </span>
      </div>
      <ul className="num mt-4 grid grid-cols-[repeat(4,auto)_1fr] items-center gap-4 border-t border-line pt-3.5 text-[0.78rem] text-muted">
        <li className="flex items-center gap-1">
          <MessageCircle size={13} aria-hidden /> {compact(p.replies)}
        </li>
        <li className="flex items-center gap-1">
          <Repeat2 size={14} aria-hidden /> {compact(p.reposts)}
        </li>
        <li className="flex items-center gap-1">
          <Heart size={13} aria-hidden /> {compact(p.likes)}
        </li>
        <li className="flex items-center gap-1">
          <Bookmark size={13} aria-hidden /> {compact(p.bookmarks)}
        </li>
        <li className="flex items-center justify-end gap-0.5 font-sans font-medium text-fg opacity-0 transition-opacity group-hover:opacity-100">
          Open <ArrowUpRight size={13} aria-hidden />
        </li>
      </ul>
    </a>
  )
}

export function YouNext() {
  const open = useDialog()
  return (
    <button
      type="button"
      onClick={() => open('launch')}
      onPointerMove={spotlight}
      className="spot group flex h-full min-h-[240px] w-full flex-col justify-between rounded-2xl border border-dashed border-fg/25 p-6 text-left transition-colors hover:border-fg/60"
    >
      <span className="num text-[0.78rem] text-muted">#{posts.length + 1}</span>
      <span>
        <span className="display block text-[1.35rem]">Your launch</span>
        <span className="mt-3 inline-flex items-center gap-1 font-semibold">
          Create launch <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
        </span>
      </span>
    </button>
  )
}

/** Launch cards on a strict grid: every row shares a baseline. */
export function PostWall({ list, you = true }: { list: Post[]; you?: boolean }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {list.map((p, k) => (
        <motion.li key={p.id} layout initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '0px 0px -8% 0px' }} transition={{ duration: 0.6, ease, delay: (k % 4) * 0.06 }}>
          <PostCard p={p} />
        </motion.li>
      ))}
      {you && (
        <li>
          <YouNext />
        </li>
      )}
    </ul>
  )
}

/** Investors as a grid of tiles, repeat clients as bars. */
export function Trust() {
  const repeat = ['Reactor', 'Sazabi', 'Beacon', 'Mem0'].map((r) => ({ r, n: posts.filter((p) => p.brand === r).length }))
  return (
    <section aria-labelledby="trust-title" className="border-t border-line bg-surface py-20 sm:py-24">
      <div className="shell grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-20">
        <div className="flex flex-col">
          <Heading id="trust-title" label="Capital" note={`Investors in the companies we have launched. They are not investors in ${brand.name}.`}>
            Client investors
          </Heading>
          <div className="mt-12 lg:mt-auto">
            <p className="mono-label">Repeat clients</p>
            <ul className="mt-5 flex flex-col gap-3">
              {repeat.map(({ r, n }) => (
                <li key={r} className="grid grid-cols-[7.5rem_minmax(0,1fr)_2rem] items-center gap-4">
                  <span className="flex h-6 items-center">
                    <ClientLogo name={r} height={17} />
                  </span>
                  <span className="flex h-1.5 gap-1">
                    {Array.from({ length: 3 }, (_, k) => (
                      <span key={k} className={cn('flex-1 rounded-full', k < n ? 'bg-accent' : 'bg-fg/10')} />
                    ))}
                  </span>
                  <span className="num text-right text-[0.84rem] text-muted">×{n}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
          {firms.map((f) => (
            <li key={f} onPointerMove={spotlight} className="spot flex aspect-[4/3] items-end bg-surface p-4 sm:aspect-square">
              <span className="num text-[0.98rem] leading-tight font-medium tracking-[-0.03em]">{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function FaqList() {
  return (
    <ul className="border-t border-line">
      {copy.faqs.map((f) => (
        <li key={f.q} className="border-b border-line">
          <details className="group py-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[1rem] font-semibold transition-colors hover:text-accent [&::-webkit-details-marker]:hidden">
              {f.q}
              <span aria-hidden className="text-xl text-muted transition-transform duration-300 group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 max-w-xl text-muted">{f.a}</p>
          </details>
        </li>
      ))}
    </ul>
  )
}

export function BookPanel({ compact: small }: { compact?: boolean }) {
  return brand.calendly ? (
    <iframe
      title="Book a call on Calendly"
      src={`${brand.calendly}?hide_gdpr_banner=1&embed_type=Inline&embed_domain=${location.hostname}`}
      className={cn('w-full rounded-3xl border border-line bg-surface', small ? 'h-[560px]' : 'h-[700px]')}
    />
  ) : (
    <BookingCalendar className="border border-line !shadow-none dark:!ring-0" />
  )
}

/** Closing band on every page: Earthrise behind one line and one button. */
export function CtaBand() {
  const open = useDialog()
  return (
    <section aria-labelledby="cta-title" className="relative isolate overflow-hidden bg-black text-white">
      <img {...space('earthrise')} alt="" loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover object-[50%_60%]" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(0_0_0/0.2),rgb(0_0_0/0.75))]" />
      <div className="shell flex min-h-[580px] flex-col items-center justify-end pt-24 pb-16 text-center">
        <h2 id="cta-title" className="display text-[clamp(1.55rem,2.4vw,2.1rem)] tracking-[-0.03em]">
          Your launch is next.
        </h2>
        <p className="mt-3 text-[0.98rem] text-white/70">30 minutes. Your launch, your date, our plan.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => open('launch')} className="h-11 rounded-full bg-white px-5 text-[0.95rem] font-semibold text-black transition-colors hover:bg-fill hover:text-white">
            Create launch
          </button>
          <Button href="/live" variant="outlineDark" size="md" arrow={false} className="text-white ring-white/30 hover:bg-white hover:text-black">
            Browse the directory
          </Button>
        </div>
        <p className="mt-14 text-[0.7rem] tracking-wide text-white/45">Earthrise. Apollo 8, 24 December 1968. NASA.</p>
      </div>
    </section>
  )
}
