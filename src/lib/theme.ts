export type Theme = 'light' | 'dark'

const KEY = 'nm-theme'

/** The theme in effect right now. Light unless the visitor chose dark. */
export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
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

/** Calls back whenever the visitor switches theme. */
export function onThemeChange(cb: () => void) {
  window.addEventListener('themechange', cb)
  return () => window.removeEventListener('themechange', cb)
}

/** Reads a color token such as "--fg" as an [r, g, b] triplet for canvas drawing. */
export function tokenRGB(name: string): [number, number, number] {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  const hex = v.startsWith('#') ? v.slice(1) : '000000'
  const full = hex.length === 3 ? hex.replace(/./g, (c) => c + c) : hex
  const n = parseInt(full, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
