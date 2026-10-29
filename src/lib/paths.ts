/** URL for a file in public/art, correct on any page and under any base path (e.g. /new-media/). */
export const art = (file: string) =>
  // The single-file preview embeds its images and lists them on window.__NM_ART__.
  (window as unknown as { __NM_ART__?: Record<string, string> }).__NM_ART__?.[file] ??
  `${import.meta.env.BASE_URL}art/${file}`

/** Router basename: the site's base path when it is absolute, otherwise the root. */
export const basename = import.meta.env.BASE_URL.startsWith('/') ? import.meta.env.BASE_URL.replace(/\/$/, '') || '/' : '/'

/** The single-file preview cannot use real paths, so it routes with the URL hash instead. */
export const useHashRouting = import.meta.env.MODE === 'single'
