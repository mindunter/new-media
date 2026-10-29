import { Camera, Clapperboard, Headphones, Laptop, Megaphone, Mic, Monitor, Podcast, Radio, Smartphone } from 'lucide-react'
import { siApplepodcasts, siInstagram, siSpotify, siThreads, siTiktok, siX, siYoutube } from 'simple-icons'
import type { ReactNode } from 'react'

/** Simple LinkedIn "in" glyph (not in simple-icons). */
const LINKEDIN =
  'M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z'

export type Platform = { id: string; name: string; path: string; color: string | null }

/** Platforms we distribute on. color null means "use the text color" so it reads in both themes. */
export const platforms: Platform[] = [
  { id: 'x', name: 'X', path: siX.path, color: null },
  { id: 'linkedin', name: 'LinkedIn', path: LINKEDIN, color: '#0a66c2' },
  { id: 'youtube', name: 'YouTube', path: siYoutube.path, color: '#ff0000' },
  { id: 'instagram', name: 'Instagram', path: siInstagram.path, color: '#e4405f' },
  { id: 'tiktok', name: 'TikTok', path: siTiktok.path, color: null },
  { id: 'threads', name: 'Threads', path: siThreads.path, color: null },
  { id: 'spotify', name: 'Spotify', path: siSpotify.path, color: '#1db954' },
  { id: 'podcasts', name: 'Apple Podcasts', path: siApplepodcasts.path, color: '#9933cc' },
]

export function PlatformIcon({ p, size = 24 }: { p: Platform; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden style={{ color: p.color ?? 'currentColor' }}>
      <path d={p.path} fill="currentColor" />
    </svg>
  )
}

/** Media devices and formats, drawn with Lucide. */
export const devices: { id: string; name: string; icon: ReactNode }[] = [
  { id: 'phone', name: 'Phone', icon: <Smartphone /> },
  { id: 'laptop', name: 'Laptop', icon: <Laptop /> },
  { id: 'monitor', name: 'Desktop', icon: <Monitor /> },
  { id: 'camera', name: 'Camera', icon: <Camera /> },
  { id: 'mic', name: 'Microphone', icon: <Mic /> },
  { id: 'headphones', name: 'Headphones', icon: <Headphones /> },
  { id: 'podcast', name: 'Podcast', icon: <Podcast /> },
  { id: 'clapper', name: 'Video', icon: <Clapperboard /> },
  { id: 'radio', name: 'Audio', icon: <Radio /> },
  { id: 'megaphone', name: 'Announcement', icon: <Megaphone /> },
]
