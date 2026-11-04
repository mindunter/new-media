import { motion, useInView } from 'motion/react'
import { ArrowUpRight, Bookmark, Heart, MessageCircle, Repeat2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router'
import { BookingCalendar } from '@/components/BookingCalendar'
import { Button } from '@/components/Button'
import { ClientLogo } from '@/components/ClientLogo'
import { Logo, LogoFull } from '@/components/Logo'
import { Reveal } from '@/components/Reveal'
import { ThemeToggle } from '@/components/ThemeToggle'
import { brand, fundingTotal, logoRow, postUrl, posts, totalViews, type Post } from '@/content'
import { art } from '@/lib/paths'
import { cn, compact, prefersReducedMotion } from '@/lib/utils'

export const ease = [0.16, 1, 0.3, 1] as const
export const byViews = [...posts].sort((a, b) => b.views - a.views)
export const byDate = [...posts].sort((a, b) => b.date.localeCompare(a.date))
export const companies = new Set(posts.map((p) => p.brand)).size
const firms = ['Lightspeed', 'Khosla Ventures', 'Insight Partners', 'Felicis', 'Y Combinator', 'Amplify Partners', 'South Park Commons', 'Village Global']
const when = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })
export const millions = (n: number) => `${(Math.floor(n / 100_000) / 10).toFixed(1)}M+`

/** All shared copy. Short, direct, nothing decorative. */
export const copy = {
  hero: 'Launch amplification on X for AI companies.',
  sub: 'Your launch, distributed through the founders, engineers and creators your buyers follow.',
  steps: [
    { n: '01', title: 'Brief', body: 'We define the story, the proof and the audience.', more: 'One call, one written plan: the message, the demo, the date and the accounts that matter to your buyers.' },
    { n: '02', title: 'Seed', body: 'Relevant accounts get early access to the product.', more: 'Founders, engineers and creators try the product before launch, so every post is first-hand.' },
    { n: '03', title: 'Launch', body: 'The network posts within the first hour.', more: 'Quote posts, replies and original posts land in the first hour, when the algorithm decides reach.' },
    { n: '04', title: 'Report', body: 'Follow-up coverage for 30 days, and a full report.', more: 'A live view in launch week, then views, engagement and reach by account and by post.' },
  ],
  deliverables: ['Launch plan and message', 'Seeded early access', 'Launch-hour network posting', '30 days of follow-up coverage', 'Report by account and post'],
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

/** Image props for a NASA photo in public/art/space, at two widths. */
export function space(name: string) {
  const single = !!(window as unknown as { __NM_ART__?: unknown }).__NM_ART__
  const small = art(`space/${name}-1200.webp`)
  // The single-file preview embeds images as data URIs, which cannot sit in a srcset.
  return single ? { src: small } : { src: small, srcSet: `${small} 1200w, ${art(`space/${name}-2400.webp`)} 2400w`, sizes: '100vw' }
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
      <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-fg/10 text-sm font-semibold">
        {p.name[0]}
      </span>
    )
  }
  return <img src={art(`x/av-${p.handle}.webp`)} alt="" width={40} height={40} loading="lazy" className="size-10 shrink-0 rounded-full bg-fg/10 object-cover" />
}

export function Heading({ id, children, note, label }: { id: string; children: React.ReactNode; note?: string; label?: string }) {
  return (
    <div>
      {label && <p className="mono-label mb-4">{label}</p>}
      <h2 id={id} className="display text-[clamp(1.6rem,2.6vw,2.25rem)] tracking-[-0.03em]">
        {children}
      </h2>
      {note && <p className="mt-2 max-w-xl text-[0.95rem] text-muted">{note}</p>}
    </div>
  )
}

/** A text link with an arrow, for "see all" style moves between pages. */
export function More({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="group inline-flex items-center gap-1 text-[0.95rem] font-semibold">
      {children}
      <ArrowUpRight size={16} aria-hidden className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </Link>
  )
}

/* ------------------------------ frame ------------------------------ */

const links = [
  { to: '/work', label: 'Launches' },
  { to: '/live', label: 'Live', live: true },
  { to: '/process', label: 'Process' },
]

/** Sits light over each page's photograph, then turns solid once the page scrolls. */
export function TopBar() {
  const [solid, setSolid] = useState(false)
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 40)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <header className={cn('fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300', solid ? 'border-line bg-page/85 text-fg backdrop-blur-xl' : 'border-transparent text-white')}>
      <nav aria-label="Main" className="shell grid h-16 grid-cols-[1fr_auto] items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
        <Link to="/" aria-label={`${brand.name}, home`} className="justify-self-start">
          <Logo className="h-7 sm:h-8" />
        </Link>
        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink to={l.to} className={({ isActive }) => cn('flex items-center gap-2 text-[0.92rem] font-medium transition-opacity hover:opacity-100', isActive ? 'opacity-100' : 'opacity-70')}>
                {l.live && <span aria-hidden className="live-dot !size-1.5" />}
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-1 justify-self-end">
          <ThemeToggle className="max-sm:hidden" />
          <Button href="/contact" variant={solid ? 'ink' : 'light'} size="md" arrow={false} className="h-10 px-4 text-[0.9rem] shadow-none">
            Book a call
          </Button>
        </div>
      </nav>
      {/* Phone: the page links sit in a second row. */}
      <ul className="shell flex h-10 items-center gap-6 text-[0.88rem] md:hidden">
        {links.map((l) => (
          <li key={l.to}>
            <NavLink to={l.to} className={({ isActive }) => cn('flex items-center gap-1.5 font-medium', isActive ? 'opacity-100' : 'opacity-70')}>
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
  const x = brand.socials.find((s) => s.label === 'X')
  return (
    <footer className="border-t border-line">
      <div className="shell grid gap-10 py-12 md:grid-cols-[1fr_auto]">
        <div>
          <LogoFull className="h-auto w-24" />
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium">
            {[{ to: '/', label: 'Home' }, ...links, { to: '/contact', label: 'Book a call' }].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="hover:text-accent">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-3 text-sm md:items-end">
          {x && (
            <a href={x.href} target="_blank" rel="noreferrer" className="flex items-center gap-2 font-medium hover:text-accent">
              <XLogo className="size-4" /> @newmediahq
            </a>
          )}
          <a href={`mailto:${brand.email}`} className="font-medium hover:text-accent">
            {brand.email}
          </a>
          <span className="text-muted">
            © {new Date().getFullYear()} {brand.name}
          </span>
        </div>
      </div>
      <p className="shell border-t border-line py-5 text-xs text-muted">Photography: NASA, Apollo 8 and Apollo 11, 1968 to 1969. Public domain. Use does not imply endorsement by NASA.</p>
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
  /** split: photo on the right, words on the left. full: photo behind centred words. */
  layout?: 'split' | 'full'
  pos?: string
  tall?: boolean
  foot?: React.ReactNode
  /** Darken a busy photo further so the words stay readable. */
  dim?: boolean
}

/**
 * Every page opens on a photograph from the Apollo programme. Space is black,
 * so the photo blends into the page edge rather than sitting in a box.
 */
export function PageHero({ img, caption, title, sub, label, children, layout = 'split', pos = '50% 50%', tall, foot, dim }: HeroProps) {
  const full = layout === 'full'
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
      <div className={cn('shell flex w-full flex-1 flex-col pt-36 pb-12 md:pt-32', full ? 'items-center justify-center text-center' : 'justify-end max-lg:pt-[48svh]')}>
        <div className={cn(full ? 'flex flex-col items-center' : 'max-w-[36rem]')}>
          {label && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.2 }} className="mono-label mb-5 flex items-center gap-2 !text-white/70">
              {label}
            </motion.div>
          )}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease, delay: 0.15 }}
            className="display max-w-[22ch] text-[clamp(2rem,4vw,3.25rem)] leading-[1.08] tracking-[-0.035em]"
          >
            {title}
          </motion.h1>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease, delay: 0.35 }} className={cn(full && 'flex flex-col items-center')}>
            {sub && <p className="mt-5 max-w-[30rem] text-[0.98rem] leading-relaxed text-pretty text-white/70 sm:text-[1.05rem]">{sub}</p>}
            {children && <div className="mt-7 flex flex-wrap items-center gap-3">{children}</div>}
          </motion.div>
        </div>
      </div>
      {foot}
      <p className="shell w-full pb-5 text-right text-[0.7rem] tracking-wide text-white/45">{caption}</p>
    </section>
  )
}

/* ------------------------------ sections ------------------------------ */

export function LogoFlow({ className }: { className?: string }) {
  const row = (hidden?: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {logoRow.map((n) => (
        <li key={n} className="flex h-12 shrink-0 items-center px-7 opacity-60 transition-opacity hover:opacity-100 sm:px-10">
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

export function Figures() {
  const items = [
    { v: totalViews, f: millions, k: 'Views' },
    { v: fundingTotal, f: (n: number) => `$${n.toFixed(1)}M+`, k: 'Funding announced' },
    { v: posts.length, f: (n: number) => `${Math.round(n)}`, k: 'Launches' },
    { v: companies, f: (n: number) => `${Math.round(n)}`, k: 'AI companies' },
  ]
  return (
    <section aria-label="Results" className="border-b border-line">
      <dl className="shell grid grid-cols-2 lg:grid-cols-4">
        {items.map((s, k) => (
          <div key={s.k} className={cn('border-line py-8 pr-6', k % 2 === 1 && 'border-l pl-6', k >= 2 && 'max-lg:border-t', k === 2 && 'lg:border-l lg:pl-6')}>
            <dd className="display text-[clamp(1.6rem,2.6vw,2.25rem)] leading-none tracking-[-0.03em]">
              <Count to={s.v} format={s.f} />
            </dd>
            <dt className="mt-3 text-sm text-muted">{s.k}</dt>
          </div>
        ))}
      </dl>
    </section>
  )
}

/** One launch post, drawn like the post on X: the words first, the numbers underneath. */
export function PostCard({ p }: { p: Post }) {
  return (
    <a
      href={postUrl(p)}
      target="_blank"
      rel="noreferrer"
      aria-label={`${p.brand}, ${p.title}: ${compact(p.views)} views. Opens the post on X.`}
      className="group block rounded-2xl border border-line bg-surface p-5 transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-fg/30"
    >
      <div className="flex items-center gap-3">
        <Avatar p={p} />
        <div className="min-w-0 flex-1 leading-tight">
          <p className="flex items-center gap-2 text-[0.95rem] font-semibold">
            <span className="truncate">{p.name}</span>
            <span className="shrink-0 text-[0.8rem] font-normal text-muted">{when(p.date)}</span>
          </p>
          <p className="truncate text-[0.84rem] text-muted">@{p.handle}</p>
        </div>
        <XLogo className="size-4 shrink-0 text-muted transition-colors group-hover:text-fg" />
      </div>
      <p className="mt-4 line-clamp-5 text-[0.95rem] leading-[1.45] whitespace-pre-line text-fg/90">{p.text}</p>
      {p.poster !== false && (
        <div className="mt-4 aspect-video overflow-hidden rounded-xl border border-line bg-fg/5">
          <img src={art(`x/p-${p.id}.webp`)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
        </div>
      )}
      <div className="mt-5 flex items-end justify-between border-t border-line pt-4">
        <p className="leading-none">
          <span className="display text-[1.5rem] tracking-[-0.03em]">{compact(p.views)}</span>
          <span className="ml-1.5 text-sm text-muted">views</span>
        </p>
        <span className="flex h-6 items-center text-fg/70">
          <ClientLogo name={p.brand} height={16} />
        </span>
      </div>
      <ul className="mt-3 flex items-center gap-4 text-[0.82rem] text-muted">
        <li className="flex items-center gap-1">
          <MessageCircle size={14} aria-hidden /> {compact(p.replies)}
        </li>
        <li className="flex items-center gap-1">
          <Repeat2 size={15} aria-hidden /> {compact(p.reposts)}
        </li>
        <li className="flex items-center gap-1">
          <Heart size={14} aria-hidden /> {compact(p.likes)}
        </li>
        <li className="flex items-center gap-1">
          <Bookmark size={14} aria-hidden /> {compact(p.bookmarks)}
        </li>
        <li className="ml-auto flex items-center gap-1 font-medium text-fg opacity-0 transition-opacity group-hover:opacity-100">
          Open <ArrowUpRight size={14} aria-hidden />
        </li>
      </ul>
    </a>
  )
}

export function YouNext() {
  return (
    <Link to="/contact" className="group flex min-h-[220px] flex-col justify-end rounded-2xl border border-dashed border-fg/25 p-6 transition-colors hover:border-fg/60 hover:bg-surface">
      <p className="display text-[1.35rem]">Your launch</p>
      <p className="mt-4 inline-flex items-center gap-1 font-semibold">
        Book a call <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
      </p>
    </Link>
  )
}

export function PostWall({ list, you = true }: { list: Post[]; you?: boolean }) {
  return (
    <ul className="columns-1 gap-5 sm:columns-2 lg:columns-3 xl:columns-4 [&>li]:mb-5 [&>li]:break-inside-avoid">
      {list.map((p) => (
        <li key={p.id}>
          <PostCard p={p} />
        </li>
      ))}
      {you && (
        <li>
          <YouNext />
        </li>
      )}
    </ul>
  )
}

export function Steps({ detail }: { detail?: boolean }) {
  return (
    <ol className="border-t border-line">
      {copy.steps.map((s) => (
        <li key={s.n} className="border-b border-line">
          <Reveal className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-baseline gap-4 py-7 sm:grid-cols-[4.5rem_10rem_minmax(0,1fr)]">
            <span className="mono-label">{s.n}</span>
            <h3 className="text-[1.05rem] font-semibold">{s.title}</h3>
            <div className="max-sm:col-start-2">
              <p className={cn(detail ? 'text-fg' : 'text-muted')}>{s.body}</p>
              {detail && <p className="mt-2 text-[0.95rem] text-muted">{s.more}</p>}
            </div>
          </Reveal>
        </li>
      ))}
    </ol>
  )
}

export function Trust() {
  const repeat = ['Reactor', 'Sazabi', 'Beacon', 'Mem0']
  return (
    <section aria-labelledby="trust-title" className="border-t border-line bg-surface py-20 sm:py-24">
      <div className="shell grid gap-14 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <Heading id="trust-title" note={`Investors in the companies we have launched. They are not investors in ${brand.name}.`}>
            Client investors
          </Heading>
          <p className="mono-label mt-12">Repeat clients</p>
          <ul className="mt-4 flex flex-wrap items-center gap-x-10 gap-y-4">
            {repeat.map((r) => (
              <li key={r} className="flex items-center gap-2.5">
                <ClientLogo name={r} height={20} />
                <span className="mono-label">×{posts.filter((p) => p.brand === r).length}</span>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal>
          <ul className="grid grid-cols-2 border-t border-line">
            {firms.map((f, k) => (
              <li key={f} className={cn('border-b border-line py-4 text-[0.98rem]', k % 2 === 1 && 'border-l pl-6')}>
                {f}
              </li>
            ))}
          </ul>
        </Reveal>
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

export function BookPanel() {
  return brand.calendly ? (
    <iframe
      title="Book a call on Calendly"
      src={`${brand.calendly}?hide_gdpr_banner=1&embed_type=Inline&embed_domain=${location.hostname}`}
      className="h-[700px] w-full rounded-3xl border border-line bg-surface"
    />
  ) : (
    <BookingCalendar className="border border-line !shadow-none dark:!ring-0" />
  )
}

/** Closing band on every page: Earthrise behind one line and one button. */
export function CtaBand() {
  return (
    <section aria-labelledby="cta-title" className="relative isolate overflow-hidden bg-black text-white">
      <img {...space('earthrise')} alt="" loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover object-[50%_60%]" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(0_0_0/0.2),rgb(0_0_0/0.75))]" />
      <div className="shell flex min-h-[580px] flex-col items-center justify-end pt-24 pb-16 text-center">
        <h2 id="cta-title" className="display text-[clamp(1.6rem,2.6vw,2.25rem)] tracking-[-0.03em]">
          Your launch is next.
        </h2>
        <p className="mt-3 text-[0.98rem] text-white/70">30 minutes. Your launch, your date, our plan.</p>
        <Button href="/contact" variant="light" size="md" className="mt-7 shadow-none">
          Book a call
        </Button>
        <p className="mt-14 text-[0.7rem] tracking-wide text-white/45">Earthrise. Apollo 8, 24 December 1968. NASA.</p>
      </div>
    </section>
  )
}
