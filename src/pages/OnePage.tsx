import { motion, useInView } from 'motion/react'
import { ArrowUpRight, Bookmark, Heart, MessageCircle, Repeat2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { BookingCalendar } from '@/components/BookingCalendar'
import { Button } from '@/components/Button'
import { ClientLogo } from '@/components/ClientLogo'
import { Logo, LogoFull } from '@/components/Logo'
import { Reveal } from '@/components/Reveal'
import { ThemeToggle } from '@/components/ThemeToggle'
import { asOf, brand, fundingTotal, logoRow, postUrl, posts, totalViews, type Post } from '@/content'
import { art } from '@/lib/paths'
import { scrollToHash } from '@/lib/scroll'
import { cn, compact, prefersReducedMotion } from '@/lib/utils'

const ease = [0.16, 1, 0.3, 1] as const
const byViews = [...posts].sort((a, b) => b.views - a.views)
const byDate = [...posts].sort((a, b) => b.date.localeCompare(a.date))
const companies = new Set(posts.map((p) => p.brand)).size
const firms = ['Lightspeed', 'Khosla Ventures', 'Insight Partners', 'Felicis', 'Y Combinator', 'Amplify Partners', 'South Park Commons', 'Village Global']
const when = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })
const millions = (n: number) => `${(Math.floor(n / 100_000) / 10).toFixed(1)}M+`

/** All copy on the page. Short, direct, nothing decorative. */
const copy = {
  hero: 'Launch amplification on X for AI companies.',
  sub: 'Your launch, distributed through the founders, engineers and creators your buyers follow.',
  steps: [
    { n: '01', title: 'Brief', body: 'We define the story, the proof and the audience.' },
    { n: '02', title: 'Seed', body: 'Relevant accounts get early access to the product.' },
    { n: '03', title: 'Launch', body: 'The network posts within the first hour.' },
    { n: '04', title: 'Report', body: 'Follow-up coverage for 30 days, and a full report.' },
  ],
  faqs: [
    { q: 'Which platforms?', a: 'X first. LinkedIn on request.' },
    { q: 'How much lead time?', a: 'Two weeks is ideal. Five days is possible.' },
    { q: 'Are posts disclosed?', a: 'Yes. Paid posts are disclosed in line with platform rules and FTC guidance.' },
    { q: 'How are results reported?', a: 'A live view during launch week, then a full report by account and post.' },
    { q: 'Who do you work with?', a: 'AI and technology companies, from seed to late stage.' },
  ],
}

const XLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const go = (href: string) => (e: React.MouseEvent) => {
  e.preventDefault()
  scrollToHash(href)
}

/** Counts up to `to` once it scrolls into view. */
function Count({ to, format }: { to: number; format: (n: number) => string }) {
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

function Heading({ id, children, note }: { id: string; children: React.ReactNode; note?: string }) {
  return (
    <div>
      <h2 id={id} className="display text-[clamp(1.6rem,2.6vw,2.25rem)] tracking-[-0.03em]">
        {children}
      </h2>
      {note && <p className="mt-2 text-[0.95rem] text-muted">{note}</p>}
    </div>
  )
}

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
    { href: '#process', label: 'Process' },
    { href: '#faq', label: 'FAQ' },
  ]
  return (
    <header className={cn('fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300', solid ? 'border-line bg-page/85 backdrop-blur-xl' : 'border-transparent')}>
      <nav aria-label="Main" className="shell grid h-16 grid-cols-[1fr_auto] items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
        <a href="#top" onClick={go('#top')} aria-label={`${brand.name}, back to top`} className="justify-self-start">
          <Logo className="h-7 sm:h-8" />
        </a>
        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={go(l.href)} className="text-[0.92rem] font-medium text-fg/75 transition-colors hover:text-fg">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-1 justify-self-end">
          <ThemeToggle className="max-sm:hidden" />
          <Button href="#book" variant="ink" size="md" className="h-10 px-4 text-[0.9rem]">
            Book a call
          </Button>
        </div>
      </nav>
    </header>
  )
}

function LogoFlow() {
  const row = (hidden?: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {logoRow.map((n) => (
        <li key={n} className="flex h-12 shrink-0 items-center px-7 text-fg/60 transition-colors hover:text-fg sm:px-10">
          <ClientLogo name={n} height={22} />
        </li>
      ))}
    </ul>
  )
  return (
    <div aria-label="Clients" role="group" className="logo-flow flex overflow-hidden">
      <ul className="flex w-max shrink-0">
        <li>{row()}</li>
        <li>{row(true)}</li>
      </ul>
    </div>
  )
}

function HeroBlock() {
  return (
    <section id="top" className="relative isolate flex min-h-[86svh] flex-col overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[70%] bg-[radial-gradient(50%_60%_at_50%_0%,color-mix(in_srgb,var(--fill)_12%,transparent),transparent_75%)]" />
      <div className="shell flex flex-1 flex-col items-center justify-center pt-28 pb-14 text-center">
        <h1 className="display max-w-[22ch] text-[clamp(2rem,4vw,3.25rem)] leading-[1.08] tracking-[-0.035em]">
          <motion.span className="inline-block" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease, delay: 0.1 }}>
            {copy.hero}
          </motion.span>
        </h1>
        <motion.div className="flex flex-col items-center" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease, delay: 0.35 }}>
          <p className="mt-5 max-w-[30rem] text-[0.98rem] leading-relaxed text-muted text-pretty sm:text-[1.05rem]">{copy.sub}</p>
          <Button href="#book" variant="ink" size="md" className="mt-7">
            Book a call
          </Button>
        </motion.div>
      </div>
      <motion.div className="pb-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 0.6 }}>
        <LogoFlow />
      </motion.div>
    </section>
  )
}

function Figures() {
  const items = [
    { v: totalViews, f: millions, k: 'Views' },
    { v: fundingTotal, f: (n: number) => `$${n.toFixed(1)}M+`, k: 'Funding announced' },
    { v: posts.length, f: (n: number) => `${Math.round(n)}`, k: 'Launches' },
    { v: companies, f: (n: number) => `${Math.round(n)}`, k: 'AI companies' },
  ]
  return (
    <section aria-label="Results" className="border-y border-line">
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
function PostCard({ p }: { p: Post }) {
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

function YouNext() {
  return (
    <a href="#book" onClick={go('#book')} className="group flex min-h-[220px] flex-col justify-end rounded-2xl border border-dashed border-fg/25 p-6 transition-colors hover:border-fg/60 hover:bg-surface">
      <p className="display text-[1.35rem]">Your launch</p>
      <p className="mt-4 inline-flex items-center gap-1 font-semibold">
        Book a call <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
      </p>
    </a>
  )
}

function Launches() {
  const [sort, setSort] = useState<'views' | 'new'>('views')
  const [all, setAll] = useState(false)
  const list = (sort === 'views' ? byViews : byDate).slice(0, all ? undefined : 8)
  return (
    <section id="launches" aria-labelledby="launches-title" className="py-20 sm:py-24">
      <div className="shell">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <Heading id="launches-title" note={`Public posts on X. Figures as of ${asOf}.`}>
            Launches
          </Heading>
          <div role="group" aria-label="Sort launches" className="flex rounded-full border border-line p-1 text-sm">
            {(
              [
                ['views', 'Most viewed'],
                ['new', 'Newest'],
              ] as const
            ).map(([k, l]) => (
              <button key={k} type="button" aria-pressed={sort === k} onClick={() => setSort(k)} className={cn('rounded-full px-4 py-1.5 font-medium transition-colors', sort === k ? 'bg-fg text-page' : 'text-muted hover:text-fg')}>
                {l}
              </button>
            ))}
          </div>
        </Reveal>

        <ul className="mt-12 columns-1 gap-5 sm:columns-2 lg:columns-3 xl:columns-4 [&>li]:mb-5 [&>li]:break-inside-avoid">
          {list.map((p) => (
            <li key={p.id}>
              <PostCard p={p} />
            </li>
          ))}
          <li>
            <YouNext />
          </li>
        </ul>

        {!all && (
          <div className="mt-6 flex justify-center">
            <Button href="#launches" variant="outline" arrow={false} onClick={() => setAll(true)}>
              Show all {posts.length}
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}

function Process() {
  return (
    <section id="process" aria-labelledby="process-title" className="border-t border-line py-20 sm:py-24">
      <div className="shell grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
        <Reveal className="lg:self-start">
          <Heading id="process-title" note="One team, one plan, one report.">
            Process
          </Heading>
        </Reveal>
        <ol className="border-t border-line">
          {copy.steps.map((s) => (
            <li key={s.n} className="border-b border-line">
              <Reveal className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-baseline gap-4 py-7 sm:grid-cols-[4.5rem_10rem_minmax(0,1fr)]">
                <span className="mono-label">{s.n}</span>
                <h3 className="text-[1.05rem] font-semibold">{s.title}</h3>
                <p className="text-muted max-sm:col-start-2">{s.body}</p>
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

function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="border-t border-line py-20 sm:py-24">
      <div className="shell grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
        <Reveal>
          <Heading id="faq-title">FAQ</Heading>
        </Reveal>
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
      </div>
    </section>
  )
}

function Book() {
  return (
    <section id="book" aria-labelledby="book-title" className="border-t border-line py-20 sm:py-24">
      <div className="shell grid items-start gap-14 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <Heading id="book-title" note="30 minutes. Your launch, your date, our plan.">
            Book a call
          </Heading>
          <p className="mt-8 text-muted">
            Email{' '}
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
            <BookingCalendar className="border border-line !shadow-none dark:!ring-0" />
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
      <div className="shell flex flex-wrap items-center justify-between gap-8 py-10">
        <LogoFull className="h-auto w-24" />
        <div className="flex flex-wrap items-center gap-6 text-sm">
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
    </footer>
  )
}

/** The whole site: one page, only what converts. */
export default function OnePage() {
  return (
    <div className="guides">
      <a href="#main" className="sr-only z-[200] rounded-full bg-deep px-4 py-2 text-on-deep focus:not-sr-only focus:fixed focus:top-4 focus:left-4">
        Skip to content
      </a>
      <TopBar />
      <main id="main">
        <HeroBlock />
        <Figures />
        <Launches />
        <Process />
        <Trust />
        <Faq />
        <Book />
      </main>
      <Footer />
    </div>
  )
}
