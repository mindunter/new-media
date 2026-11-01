import { ArrowRight, CalendarPlus, Check, ChevronLeft, ChevronRight, LoaderCircle, Video } from 'lucide-react'
import { useMemo, useState } from 'react'
import { brand } from '@/content'
import { cn } from '@/lib/utils'

const SLOTS = ['10:00', '11:30', '14:00', '15:30', '17:00']
const MINUTES = 30
const AHEAD_DAYS = 45
const WEEK = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const stamp = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, '')

/** Book a call in three clicks: a date, a time, and an email address. Nothing else is asked for. */
export function BookingCalendar({ className }: { className?: string }) {
  const today = useMemo(() => dayStart(new Date()), [])
  const last = useMemo(() => new Date(today.getTime() + AHEAD_DAYS * 86_400_000), [today])
  const [view, setView] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [date, setDate] = useState<Date | null>(null)
  const [time, setTime] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'booked' | 'requested' | 'taken' | 'error'>('idle')

  const live = Boolean(brand.bookingEndpoint)
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const cells = useMemo(() => {
    const lead = (view.getDay() + 6) % 7
    const count = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate()
    return [...Array<null>(lead).fill(null), ...Array.from({ length: count }, (_, i) => new Date(view.getFullYear(), view.getMonth(), i + 1))]
  }, [view])

  const start = () => {
    const [h, m] = (time ?? '10:00').split(':').map(Number)
    const d = new Date(date ?? today)
    d.setHours(h, m, 0, 0)
    return d
  }
  const nice = date && time ? `${date.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })} at ${time}` : ''

  const calendarLink = () => {
    const s = start()
    const e = new Date(s.getTime() + MINUTES * 60_000)
    const q = new URLSearchParams({
      action: 'TEMPLATE',
      text: 'Call with New Media',
      dates: `${stamp(s)}/${stamp(e)}`,
      details: 'A 30 minute call about your launch.',
      add: brand.email,
    })
    return `https://calendar.google.com/calendar/render?${q}`
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid || !date || !time) return
    if (!live) {
      // No booking service connected yet: send the request as a prefilled email.
      const body = `I would like to book a call on ${nice} (${zone}).\n\nMy email: ${email}`
      window.location.href = `mailto:${brand.email}?subject=${encodeURIComponent('Book a call with New Media')}&body=${encodeURIComponent(body)}`
      setStatus('requested')
      return
    }
    setStatus('sending')
    try {
      // Plain text keeps this a simple request, which Google Apps Script accepts from any site.
      const res = await fetch(brand.bookingEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ email, start: start().toISOString(), minutes: MINUTES, zone }),
      })
      const out = await res.json()
      setStatus(out.ok ? 'booked' : out.reason === 'taken' ? 'taken' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'booked' || status === 'requested') {
    return (
      <div className={cn('rounded-3xl bg-page p-6 text-fg shadow-[0_30px_70px_-30px_rgb(4_30_90/0.5)] sm:p-8', className)} role="status">
        <span className="grid size-12 place-items-center rounded-full bg-fill text-white">
          <Check size={24} aria-hidden />
        </span>
        <h3 className="display mt-5 text-[2rem]">{status === 'booked' ? 'You are booked.' : 'Almost there.'}</h3>
        <p className="mt-3 text-[1.05rem] leading-relaxed text-muted">
          {status === 'booked' ? (
            <>
              {nice}. The invite and Google Meet link are on their way to <strong className="text-fg">{email}</strong>.
            </>
          ) : (
            <>
              Your email app opened with {nice} filled in. Press send and we confirm it within one business day.
            </>
          )}
        </p>
        {status === 'requested' && (
          <a href={calendarLink()} target="_blank" rel="noreferrer" className="mt-5 inline-flex h-11 items-center gap-2 rounded-full px-5 text-[0.95rem] font-semibold text-fg ring-1 ring-fg/25 ring-inset transition-colors hover:bg-fg hover:text-page">
            <CalendarPlus size={17} aria-hidden /> Add to Google Calendar
          </a>
        )}
      </div>
    )
  }

  const prevOk = view > new Date(today.getFullYear(), today.getMonth(), 1)
  const nextOk = new Date(view.getFullYear(), view.getMonth() + 1, 1) <= last

  return (
    <form onSubmit={submit} className={cn('rounded-3xl bg-page p-5 text-fg shadow-[0_30px_70px_-30px_rgb(4_30_90/0.5)] sm:p-7', className)} aria-label="Book a call">
      <div className="flex items-center justify-between">
        <p className="text-[1.05rem] font-semibold" aria-live="polite">
          {view.toLocaleDateString('en', { month: 'long', year: 'numeric' })}
        </p>
        <div className="flex gap-1">
          <button type="button" disabled={!prevOk} aria-label="Previous month" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))} className="grid size-10 place-items-center rounded-full transition-colors hover:bg-fg/10 disabled:opacity-30">
            <ChevronLeft size={19} aria-hidden />
          </button>
          <button type="button" disabled={!nextOk} aria-label="Next month" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))} className="grid size-10 place-items-center rounded-full transition-colors hover:bg-fg/10 disabled:opacity-30">
            <ChevronRight size={19} aria-hidden />
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-7 text-center text-xs font-semibold text-muted" aria-hidden>
        {WEEK.map((d) => (
          <span key={d} className="py-1">
            {d}
          </span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <span key={`e${i}`} />
          const weekend = d.getDay() === 0 || d.getDay() === 6
          const off = weekend || d <= today || d > last
          const on = date?.getTime() === d.getTime()
          return (
            <button
              key={d.toISOString()}
              type="button"
              disabled={off}
              aria-pressed={on}
              aria-label={d.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
              onClick={() => {
                setDate(d)
                setStatus('idle')
              }}
              className={cn(
                'aspect-square max-h-11 rounded-full text-[0.95rem] font-medium transition-colors',
                off ? 'text-muted/40' : 'hover:bg-fill hover:text-white',
                !off && !on && 'bg-fill/10 text-accent',
                on && 'bg-fill text-white',
              )}
            >
              {d.getDate()}
            </button>
          )
        })}
      </div>

      {date && (
        <fieldset className="mt-4">
          <legend className="text-sm text-muted">Times in your timezone ({zone})</legend>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {SLOTS.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={time === s}
                onClick={() => {
                  setTime(s)
                  setStatus('idle')
                }}
                className={cn('h-10 rounded-full px-3.5 text-sm font-semibold ring-1 ring-inset transition-colors', time === s ? 'bg-fill text-white ring-fill' : 'text-fg ring-fg/20 hover:ring-accent')}
              >
                {s}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <label className="mt-4 block">
        <span className="text-sm font-semibold">Your email</span>
        <input
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="mt-1.5 h-12 w-full rounded-full bg-surface px-5 text-[1rem] text-fg ring-1 ring-fg/15 outline-none ring-inset placeholder:text-muted focus:ring-2 focus:ring-accent"
        />
      </label>

      <button
        type="submit"
        disabled={!valid || !date || !time || status === 'sending'}
        className="group mt-3 flex h-13 w-full items-center justify-center gap-2 rounded-full bg-fill font-semibold text-white transition-colors enabled:hover:bg-deep disabled:opacity-45"
      >
        {status === 'sending' ? <LoaderCircle size={18} className="animate-spin" aria-hidden /> : null}
        {status === 'sending' ? 'Booking' : nice ? `Book ${date?.toLocaleDateString('en', { month: 'short', day: 'numeric' })}, ${time}` : 'Book a call'}
        {status !== 'sending' && <ArrowRight size={17} aria-hidden className="transition-transform group-hover:translate-x-0.5" />}
      </button>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted" role={status === 'taken' || status === 'error' ? 'alert' : undefined}>
        {status === 'taken' ? (
          'That time was just taken. Please pick another.'
        ) : status === 'error' ? (
          <>Something went wrong. Please email {brand.email}.</>
        ) : (
          <>
            <Video size={14} aria-hidden /> 30 minutes on Google Meet. Only your email, nothing else.
          </>
        )}
      </p>
    </form>
  )
}
