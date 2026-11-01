import { BarChart2, Bookmark, Heart, MessageCircle, Play, Repeat2 } from 'lucide-react'
import { asOf, cta, postUrl, posts, type Post } from '@/content'
import { art } from '@/lib/paths'
import { compact } from '@/lib/utils'
import { Button } from './Button'
import { Reveal } from './Reveal'

const XLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)
const Verified = () => (
  <svg viewBox="0 0 24 24" aria-label="Verified" className="size-[1.05rem] shrink-0 fill-[#1d9bf0]">
    <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91C2.63 9.33 1.75 10.57 1.75 12s.88 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36z" />
  </svg>
)

const when = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })

/** One real post, drawn to read like an X embed. The whole card opens the post on X. */
function PostCard({ p }: { p: Post }) {
  return (
    <a
      href={postUrl(p)}
      target="_blank"
      rel="noreferrer"
      aria-label={`${p.name} on X: ${compact(p.views)} views`}
      className="flex w-[300px] shrink-0 flex-col rounded-2xl border border-[#cfd9de] bg-white p-4 text-[#0f1419] transition-colors hover:bg-[#f7f9f9] sm:w-[372px] dark:border-[#2f3336] dark:bg-black dark:text-[#e7e9ea] dark:hover:bg-[#080808]"
    >
      <div className="flex items-start gap-2.5">
        <img src={art(`x/av-${p.handle}.webp`)} alt="" loading="lazy" width={44} height={44} className="size-11 rounded-full bg-[#eff3f4] object-cover" />
        <div className="min-w-0 flex-1 leading-tight">
          <p className="flex items-center gap-1 text-[0.95rem] font-bold">
            <span className="truncate">{p.name}</span>
            {p.verified && <Verified />}
          </p>
          <p className="truncate text-[0.875rem] text-[#536471] dark:text-[#a3acb5]">@{p.handle}</p>
        </div>
        <XLogo className="size-5 shrink-0" />
      </div>

      <p className="mt-3 line-clamp-5 min-h-[6.4em] text-[0.95rem] leading-[1.3] whitespace-pre-line">{p.text}</p>

      <div className="relative mt-3 aspect-video overflow-hidden rounded-xl border border-[#cfd9de] bg-[#eff3f4] dark:border-[#2f3336] dark:bg-[#16181c]">
        <img src={art(`x/p-${p.id}.webp`)} alt="" loading="lazy" className="h-full w-full object-cover" />
        {p.video && (
          <span className="absolute inset-0 m-auto grid size-12 place-items-center rounded-full bg-[#1d9bf0] text-white ring-2 ring-white">
            <Play size={20} fill="currentColor" aria-hidden />
          </span>
        )}
      </div>

      <p className="mt-3 text-[0.875rem] text-[#536471] dark:text-[#a3acb5]">{when(p.date)}</p>
      <ul className="mt-2.5 flex items-center justify-between border-t border-[#cfd9de] pt-2.5 text-[0.8125rem] text-[#536471] dark:border-[#2f3336] dark:text-[#a3acb5]">
        <li className="flex items-center gap-1">
          <MessageCircle size={15} aria-hidden /> {compact(p.replies)}
        </li>
        <li className="flex items-center gap-1">
          <Repeat2 size={16} aria-hidden /> {compact(p.reposts)}
        </li>
        <li className="flex items-center gap-1">
          <Heart size={15} aria-hidden /> {compact(p.likes)}
        </li>
        <li className="flex items-center gap-1">
          <Bookmark size={15} aria-hidden /> {compact(p.bookmarks)}
        </li>
        <li className="flex items-center gap-1 font-bold text-[#0f1419] dark:text-white">
          <BarChart2 size={15} aria-hidden /> {compact(p.views)}
        </li>
      </ul>
    </a>
  )
}

function Row({ items, reverse = false, dur }: { items: Post[]; reverse?: boolean; dur: string }) {
  return (
    <div className="overflow-hidden motion-reduce:overflow-x-auto">
      <ul data-reverse={reverse} style={{ '--dur': dur } as React.CSSProperties} className="post-row flex w-max gap-4 pr-4">
        {[...items, ...items].map((p, i) => (
          <li key={`${p.id}-${i}`} aria-hidden={i >= items.length || undefined} className="motion-reduce:[&:nth-child(n+10)]:hidden">
            <PostCard p={p} />
          </li>
        ))}
      </ul>
    </div>
  )
}

/** A scrolling wall of real launch posts that hit high numbers. */
export function XPosts() {
  const byViews = [...posts].sort((a, b) => b.views - a.views)
  const total = posts.reduce((n, p) => n + p.views, 0)
  return (
    <section aria-labelledby="posts-title" className="overflow-hidden bg-surface py-20 sm:py-28">
      <div className="shell mb-10 flex flex-wrap items-end justify-between gap-6">
        <Reveal>
          <p className="label-pill mb-4">Live on X</p>
          <h2 id="posts-title" className="display max-w-3xl text-[clamp(2.2rem,4.8vw,4.4rem)]">
            {compact(total)} views on <span className="serif italic">these nine posts.</span>
          </h2>
          <p className="mt-4 max-w-xl text-[1.05rem] text-muted">Real launches our network pushed. Open any of them on X and check the numbers yourself. As of {asOf}.</p>
        </Reveal>
        <Button href={cta.href} size="lg">
          {cta.label}
        </Button>
      </div>
      <div className="space-y-4">
        <Row items={byViews} dur="90s" />
        <div className="max-sm:hidden">
          <Row items={[...byViews].reverse()} reverse dur="110s" />
        </div>
      </div>
    </section>
  )
}
