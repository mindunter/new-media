import { motion, useInView } from 'motion/react'
import { ArrowUpRight, Bookmark, Heart, Repeat2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { BookingCalendar } from '@/components/BookingCalendar'
import { Button } from '@/components/Button'
import { ClientLogo } from '@/components/ClientLogo'
import { Logo, LogoFull } from '@/components/Logo'
import { Reveal } from '@/components/Reveal'
import { ThemeToggle } from '@/components/ThemeToggle'
import { asOf, backing, brand, engine, fundingTotal, hero, logoRow, postUrl, posts, totalViews, type Post } from '@/content'
import { art } from '@/lib/paths'
import { scrollToHash } from '@/lib/scroll'
import { cn, compact, prefersReducedMotion } from '@/lib/utils'

const ease = [0.16, 1, 0.3, 1] as const
const byViews = [...posts].sort((a, b) => b.views - a.views)
const mega = byViews.filter((p) => p.views >= 1_000_000)
const more = byViews.filter((p) => p.views < 1_000_000)
const companies = new Set(posts.map((p) => p.brand)).size
const firms = ['Lightspeed', 'Khosla Ventures', 'Insight Partners', 'Felicis', 'Y Combinator', 'Amplify Partners', 'South Park Commons', 'Village Global']
const when = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en', { month: 'short', year: 'numeric' })

const XLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

/** Counts up to `to` once it scrolls into view. */
function Count({ to, format, className }: { to: number; format: (n: number) => string; className?: string }) {
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
  return (
    <span ref={ref} className={className}>
      {format(n)}
    </span>
  )
}

function Avatar({ p, size = 36 }: { p: Post; size?: number }) {
  if (p.avatar === false) {
    return (
      <span aria-hidden className="grid shrink-0 place-items-center rounded-full bg-fg/10 text-sm font-semibold" style={{ width: size, height: size }}>
        {p.name[0]}
      </span>
    )
  }
  return <img src={art(`x/av-${p.handle}.webp`)} alt="" width={size} height={size} loading="lazy" className="shrink-0 rounded-full bg-fg/10 object-cover" style={{ width: size, height: size }} />
}

/** The picture from the post, or the post's own words when it has none. */
function Poster({ p, className }: { p: Post; className?: string }) {
  if (p.poster === false) {
    return (
      <div className={cn('flex flex-col justify-between bg-deep p-6 text-on-deep', className)}>
        <XLogo className="size-5 opacity-70" />
        <p className="serif text-[clamp(1.2rem,2vw,1.6rem)] leading-snug whitespace-pre-line">{p.text.split('\n\n').slice(0, 2).join('\n\n')}</p>
      </div>
    )
  }
  return <img src={art(`x/p-${p.id}.webp`)} alt="" loading="lazy" className={cn('object-cover', className)} />
}

const stats = (p: Post) => [
  { k: 'Likes', v: p.likes, I: Heart },
  { k: 'Reposts', v: p.reposts, I: Repeat2 },
  { k: 'Bookmarks', v: p.bookmarks, I: Bookmark },
]
const label = (p: Post) => `${p.brand}, ${p.title}: ${compact(p.views)} views, ${p.likes.toLocaleString('en')} likes. Opens the post on X.`

/* ------------------------------------------------------------------ */

function TopBar() {
  const [solid, setSolid] = useState(false)
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 24)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  const links = [
    { href: '#launches', label: 'Launches' },
    { href: '#how', label: 'How it works' },
    { href: '#book', label: 'Contact' },
  ]
  return (
    <header className={cn('fixed inset-x-0 top-0 z-50 transition-colors duration-300', solid ? 'border-b border-line bg-page/90 backdrop-blur-xl' : 'border-b border-transparent')}>
      <nav aria-label="Main" className="shell flex h-16 items-center justify-between gap-4">
        <a
          href="#top"
          aria-label={`${brand.name}, back to top`}
          onClick={(e) => {
            e.preventDefault()
            scrollToHash('#top')
          }}
        >
          <Logo className="h-7 sm:h-8" />
        </a>
        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={(e) => {
                  e.preventDefault()
                  scrollToHash(l.href)
                }}
                className="text-[0.92rem] font-medium text-fg/80 transition-colors hover:text-fg">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button href="#book" size="md" arrow={false} className="h-10 px-4">
            Book a call
          </Button>
        </div>
      </nav>
    </header>
  )
}

/** Real launch posts, one at a time, with their view counts. */
function LaunchStack() {
  const deck = byViews.filter((p) => p.poster !== false).slice(0, 6)
  const [i, setI] = useState(0)
  const [hold, setHold] = useState(false)
  useEffect(() => {
    if (hold || prefersReducedMotion()) return
    const id = window.setInterval(() => setI((v) => (v + 1) % deck.length), 4200)
    return () => window.clearInterval(id)
  }, [hold, deck.length])

  return (
    <div className="relative mx-auto aspect-[4/4.4] w-full max-w-[500px]" onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)}>
      {deck.map((p, k) => {
        const depth = (k - i + deck.length) % deck.length
        if (depth > 2) return null
        return (
          <motion.a
            key={p.id}
            href={postUrl(p)}
            target="_blank"
            rel="noreferrer"
            aria-label={label(p)}
            tabIndex={depth === 0 ? 0 : -1}
            aria-hidden={depth !== 0 || undefined}
            className="absolute inset-x-0 top-0 block overflow-hidden rounded-[22px] border border-line bg-surface shadow-[0_40px_80px_-40px_rgb(17_19_27/0.45)]"
            initial={false}
            animate={{ y: depth * 26, scale: 1 - depth * 0.05, opacity: depth === 0 ? 1 : 0.9 - depth * 0.25, zIndex: 10 - depth }}
            transition={{ duration: 0.8, ease }}
          >
            {/* Cards behind the front one show only their edges. */}
            <div className={cn('transition-opacity duration-500', depth !== 0 && 'opacity-0')}>
            <div className="flex items-center gap-3 px-5 pt-4 pb-3">
              <Avatar p={p} />
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-[0.95rem] font-semibold">{p.name}</p>
                <p className="truncate text-[0.82rem] text-muted">@{p.handle}</p>
              </div>
              <XLogo className="size-[18px]" />
            </div>
            <Poster p={p} className="aspect-video w-full" />
            <div className="flex items-end justify-between gap-4 px-5 pt-4 pb-5">
              <div className="min-w-0">
                <span className="flex h-6 items-center">
                  <ClientLogo name={p.brand} height={18} />
                </span>
                <p className="mt-1 truncate text-sm text-muted">{p.title}</p>
              </div>
              <div className="text-right">
                <p className="serif text-[2.6rem] leading-none">{depth === 0 ? <Count key={i} to={p.views} format={compact} /> : compact(p.views)}</p>
                <p className="mono-label mt-1">views</p>
              </div>
            </div>
            </div>
          </motion.a>
        )
      })}
      <div className="absolute inset-x-0 -bottom-2 flex justify-center gap-1.5" aria-hidden>
        {deck.map((p, k) => (
          <span key={p.id} className={cn('h-1 rounded-full transition-all duration-500', k === i ? 'w-6 bg-fill' : 'w-1.5 bg-fg/20')} />
        ))}
      </div>
    </div>
  )
}

function HeroBlock() {
  return (
    <section id="top" className="rules relative isolate overflow-hidden pt-28 pb-16 sm:pt-36 lg:pt-40 lg:pb-24">
      <div aria-hidden className="pointer-events-none absolute -top-40 right-[-10%] -z-10 size-[720px] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--fill)_16%,transparent),transparent_65%)]" />
      <div className="shell grid items-center gap-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-20">
        <div>
          <motion.p className="mono-label flex items-center gap-2.5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }}>
            <span className="live-dot" aria-hidden /> {hero.eyebrow}
          </motion.p>
          <h1 className="display mt-7 text-[clamp(2.9rem,6.6vw,6.2rem)] leading-[0.95]">
            {['We make launches', 'impossible to'].map((l, k) => (
              <span key={l} className="block overflow-y-clip pb-[0.06em]">
                <motion.span className="inline-block" initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ duration: 1, ease, delay: 0.1 + k * 0.08 }}>
                  {l}
                </motion.span>
              </span>
            ))}
            <span className="block overflow-y-clip pb-[0.12em]">
              <motion.span className="serif inline-block pr-[0.06em] font-normal text-accent italic" initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ duration: 1, ease, delay: 0.26 }}>
                scroll past.
              </motion.span>
            </span>
          </h1>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease, delay: 0.45 }}>
            <p className="mt-7 max-w-[34rem] text-[1.1rem] leading-relaxed text-muted text-pretty sm:text-[1.2rem]">{hero.sub}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button href="#book" size="lg" className="max-sm:flex-1">
                Book a call
              </Button>
              <Button href="#launches" variant="outline" size="lg" arrow={false} className="max-sm:flex-1">
                {hero.secondary}
              </Button>
            </div>
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, ease, delay: 0.3 }}>
          <LaunchStack />
        </motion.div>
      </div>

      <dl className="shell mt-20 grid grid-cols-2 lg:mt-28 lg:grid-cols-4">
        {[
          { v: totalViews, f: (n: number) => `${(Math.floor(n / 100_000) / 10).toFixed(1)}M+`, k: `Views across ${posts.length} launch posts` },
          { v: fundingTotal, f: (n: number) => `$${n.toFixed(1)}M+`, k: 'Funding announced in those launches' },
          { v: companies, f: (n: number) => `${Math.round(n)}`, k: 'AI companies launched since May 2025' },
          { v: 4, f: (n: number) => `${Math.round(n)}`, k: 'Clients who came back for more' },
        ].map((s, k) => (
          <div key={s.k} className={cn('border-t border-line py-6 pr-6', k % 2 === 1 && 'max-lg:pl-6 max-lg:border-l', k > 0 && 'lg:border-l lg:pl-8')}>
            <dd className="serif text-[clamp(2.4rem,4.4vw,3.8rem)] leading-none">
              <Count to={s.v} format={s.f} />
            </dd>
            <dt className="mt-3 text-sm text-muted">{s.k}</dt>
          </div>
        ))}
      </dl>
    </section>
  )
}

function LogoFlow() {
  const row = (hidden?: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {logoRow.map((n) => (
        <li key={n} className="flex h-14 shrink-0 items-center px-8 text-fg/70 transition-colors hover:text-fg sm:px-12">
          <ClientLogo name={n} height={24} />
        </li>
      ))}
    </ul>
  )
  return (
    <section aria-label="Companies we have launched" className="border-y border-line py-8">
      <p className="mono-label shell mb-4 text-center">Launched with us</p>
      <div className="logo-flow flex overflow-hidden">
        <ul className="flex w-max shrink-0">
          <li>{row()}</li>
          <li>{row(true)}</li>
        </ul>
      </div>
    </section>
  )
}

function StatsOver({ p }: { p: Post }) {
  return (
    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[#0b0c14]/85 via-[#0b0c14]/30 to-transparent p-5 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
      <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
        {stats(p).map(({ k, v, I }) => (
          <li key={k} className="flex items-center gap-1.5">
            <I size={15} aria-hidden /> {v.toLocaleString('en')} <span className="text-white/70">{k.toLowerCase()}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 flex items-center gap-1 text-sm font-semibold">
        Open on X <ArrowUpRight size={15} aria-hidden />
      </p>
    </div>
  )
}

function MegaCard({ p }: { p: Post }) {
  return (
    <a href={postUrl(p)} target="_blank" rel="noreferrer" aria-label={label(p)} className="group block">
      <div className="relative aspect-[16/10] overflow-hidden rounded-[20px] border border-line bg-surface">
        <Poster p={p} className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
        <StatsOver p={p} />
      </div>
      <div className="mt-5 flex items-end justify-between gap-6">
        <div className="min-w-0">
          <span className="flex h-7 items-center">
            <ClientLogo name={p.brand} height={22} />
          </span>
          <p className="mt-1.5 text-muted">
            {p.title} · {when(p.date)}
          </p>
        </div>
        <p className="serif shrink-0 text-[clamp(2.6rem,4.6vw,4rem)] leading-none">
          {compact(p.views)}
          <span className="mono-label ml-2 align-middle">views</span>
        </p>
      </div>
    </a>
  )
}

function SmallCard({ p }: { p: Post }) {
  return (
    <a href={postUrl(p)} target="_blank" rel="noreferrer" aria-label={label(p)} className="group block">
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-line bg-surface">
        <Poster p={p} className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.05]" />
        <StatsOver p={p} />
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span className="flex h-6 items-center">
            <ClientLogo name={p.brand} height={18} />
          </span>
          <p className="mt-1 text-sm text-muted">
            {p.title} · {when(p.date)}
          </p>
        </div>
        <p className="serif shrink-0 text-[1.9rem] leading-none">{compact(p.views)}</p>
      </div>
    </a>
  )
}

function Launches() {
  return (
    <section id="launches" aria-labelledby="launches-title" className="py-24 sm:py-32">
      <div className="shell">
        <Reveal className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <p className="mono-label">Our launches</p>
            <h2 id="launches-title" className="display mt-5 max-w-3xl text-[clamp(2.4rem,5vw,4.6rem)]">
              {posts.length} launches. <span className="serif font-normal italic">Every number is public.</span>
            </h2>
          </div>
          <p className="max-w-sm text-muted">Hover a launch for its numbers, click to check it on X. Figures as of {asOf}.</p>
        </Reveal>

        <div className="mt-16 flex items-center gap-4">
          <h3 className="mono-label text-fg">Mega launches</h3>
          <span className="h-px flex-1 bg-line" />
          <span className="mono-label">1M+ views</span>
        </div>
        <ul className="mt-8 grid gap-x-8 gap-y-14 md:grid-cols-2">
          {mega.map((p) => (
            <li key={p.id}>
              <Reveal>
                <MegaCard p={p} />
              </Reveal>
            </li>
          ))}
        </ul>

        <div className="mt-24 flex items-center gap-4">
          <h3 className="mono-label text-fg">Launches</h3>
          <span className="h-px flex-1 bg-line" />
          <span className="mono-label">Under 1M views</span>
        </div>
        <ul className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {more.map((p, k) => (
            <li key={p.id}>
              <Reveal delay={(k % 4) * 0.05}>
                <SmallCard p={p} />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function How() {
  const steps = [
    { ...engine[0], meta: 'Two weeks out' },
    { ...engine[1], meta: 'One week out' },
    { ...engine[2], title: 'Launch hour', meta: 'Hour zero' },
    { ...engine[3], meta: 'The month after' },
  ]
  return (
    <section id="how" aria-labelledby="how-title" className="border-t border-line bg-surface py-24 sm:py-32">
      <div className="shell">
        <Reveal>
          <p className="mono-label">How it works</p>
          <h2 id="how-title" className="display mt-5 max-w-3xl text-[clamp(2.4rem,5vw,4.6rem)]">
            One launch, <span className="serif font-normal italic">four steps.</span>
          </h2>
        </Reveal>
        <ol className="mt-16 grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, k) => (
            <li key={s.n}>
              <Reveal delay={k * 0.06} className="border-t border-fg pt-6">
                <p className="mono-label flex justify-between">
                  <span className="text-accent">{s.n}</span>
                  <span>{s.meta}</span>
                </p>
                <h3 className="display mt-6 text-[1.8rem]">{s.title}</h3>
                <p className="mt-3 leading-relaxed text-muted">{s.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Trust() {
  const repeat = ['Reactor', 'Sazabi', 'Beacon', 'Mem0']
  return (
    <section aria-labelledby="trust-title" className="bg-deep py-24 text-on-deep sm:py-32">
      <div className="shell grid gap-16 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-24">
        <Reveal>
          <p className="mono-label !text-on-deep-muted">Who trusts us</p>
          <h2 id="trust-title" className="display mt-5 text-[clamp(2.2rem,4.4vw,4rem)]">
            Teams backed by the firms you know <span className="serif font-normal italic">launch with us.</span>
          </h2>
          <p className="mt-6 max-w-xl leading-relaxed text-on-deep-muted">
            The companies we have launched raised from these firms. The firms back those companies, not {brand.name}.
          </p>
        </Reveal>
        <div className="grid content-start gap-12">
          <Reveal>
            <p className="mono-label !text-on-deep-muted">Backed by</p>
            <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-[1.1rem]">
              {firms.map((f) => (
                <li key={f} className="border-t border-white/15 pt-3">
                  {f}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal>
            <p className="mono-label !text-on-deep-muted">Came back for more</p>
            <ul className="mt-5 flex flex-wrap items-center gap-x-10 gap-y-4">
              {repeat.map((r) => (
                <li key={r} className="flex items-center gap-3">
                  <ClientLogo name={r} height={20} />
                  <span className="mono-label !text-on-deep-muted">×{posts.filter((p) => p.brand === r).length}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function Book() {
  return (
    <section id="book" aria-labelledby="book-title" className="rules py-24 sm:py-32">
      <div className="shell grid items-start gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20">
        <Reveal>
          <p className="mono-label">Book a call</p>
          <h2 id="book-title" className="display mt-5 text-[clamp(2.6rem,5.6vw,5.2rem)]">
            Launching soon? <span className="serif font-normal text-accent italic">Let’s talk.</span>
          </h2>
          <p className="mt-6 max-w-md text-[1.1rem] leading-relaxed text-muted">
            A 30-minute call to hear about the launch and the date. Two weeks of lead time is ideal, and we have run launches in five days.
          </p>
          <p className="mt-8 text-muted">
            Or email{' '}
            <a href={`mailto:${brand.email}`} className="font-semibold text-fg underline decoration-line underline-offset-4 hover:decoration-fg">
              {brand.email}
            </a>
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          {brand.calendly ? (
            <iframe
              title="Book a call on Calendly"
              src={`${brand.calendly}?hide_gdpr_banner=1&embed_type=Inline&embed_domain=${location.hostname}`}
              className="h-[700px] w-full rounded-3xl border border-line bg-surface"
            />
          ) : (
            <BookingCalendar className="border border-line !shadow-none" />
          )}
        </Reveal>
      </div>
    </section>
  )
}

function Footer() {
  const x = brand.socials.find((s) => s.label === 'X')
  return (
    <footer className="border-t border-line">
      <div className="shell flex flex-wrap items-end justify-between gap-8 py-12">
        <div>
          <LogoFull className="h-auto w-32" />
          <p className="mt-4 max-w-xs text-sm text-muted">{hero.eyebrow}.</p>
        </div>
        <div className="flex flex-wrap items-center gap-6 text-sm">
          {x && (
            <a href={x.href} target="_blank" rel="noreferrer" className="flex items-center gap-2 font-medium hover:text-accent">
              <XLogo className="size-4" /> @newmediahq
            </a>
          )}
          <a href={`mailto:${brand.email}`} className="font-medium hover:text-accent">
            {brand.email}
          </a>
          <span className="text-muted">© {new Date().getFullYear()} {brand.name}</span>
        </div>
      </div>
    </footer>
  )
}

/** The whole site: one page, only what converts. */
export default function OnePage() {
  return (
    <>
      <a href="#main" className="sr-only z-[200] rounded-full bg-deep px-4 py-2 text-on-deep focus:not-sr-only focus:fixed focus:top-4 focus:left-4">
        Skip to content
      </a>
      <TopBar />
      <main id="main">
        <HeroBlock />
        <LogoFlow />
        <Launches />
        <How />
        <Trust />
        <Book />
      </main>
      <Footer />
    </>
  )
}
