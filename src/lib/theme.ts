export type Theme = 'light' | 'dark'

const KEY = 'nm-theme'
const media = () => window.matchMedia('(prefers-color-scheme: dark)')

/** The theme in effect right now: an explicit choice wins, otherwise the OS setting. */
export function currentTheme(): Theme {
  const set = document.documentElement.dataset.theme
  if (set === 'light' || set === 'dark') return set
  return media().matches ? 'dark' : 'light'
}

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    // Storage can be blocked; the choice then lasts for this visit only.
  }
  window.dispatchEvent(new Event('themechange'))
}

/** Calls back whenever the effective theme may have changed (toggle or OS switch). */
export function onThemeChange(cb: () => void) {
  const mq = media()
  window.addEventListener('themechange', cb)
  mq.addEventListener('change', cb)
  return () => {
    window.removeEventListener('themechange', cb)
    mq.removeEventListener('change', cb)
  }
}

/** Reads a color token such as "--fg" as an [r, g, b] triplet for canvas drawing. */
export function tokenRGB(name: string): [number, number, number] {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  const hex = v.startsWith('#') ? v.slice(1) : '000000'
  const full = hex.length === 3 ? hex.replace(/./g, (c) => c + c) : hex
  const n = parseInt(full, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
