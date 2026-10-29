// Bundles dist/ into one self-contained HTML file (CSS, JS and fonts inlined)
// for sharing a quick preview: npm run preview:file
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

const dist = 'dist-single'
let html = readFileSync(join(dist, 'index.html'), 'utf8')

const inlineFonts = (css, base) =>
  css.replace(/url\(([^)]+?\.woff2)\)/g, (_, p) => {
    const file = join(base, p.replace(/^\.\//, ''))
    return `url(data:font/woff2;base64,${readFileSync(file).toString('base64')})`
  })

html = html.replace(/<link rel="stylesheet"[^>]*href="\.\/([^"]+)"[^>]*>/g, (_, href) => {
  const css = inlineFonts(readFileSync(join(dist, href), 'utf8'), dirname(join(dist, href)))
  return `<style>${css}</style>`
})

html = html.replace(/<script type="module"[^>]*src="\.\/([^"]+)"[^>]*><\/script>/g, (_, src) => {
  const js = readFileSync(join(dist, src), 'utf8').replace(/<\/script/g, '<\\/script')
  return `<script type="module">${js}</script>`
})

html = html.replace(/<link rel="icon"[^>]*>/, () => {
  const svg = readFileSync(join(dist, 'favicon.svg')).toString('base64')
  return `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,${svg}">`
})

// Inline the rendered art (./art/*.webp) so the single file has no external images.
html = html.replace(/\.\/art\/([\w-]+\.webp)/g, (_, f) => {
  return `data:image/webp;base64,${readFileSync(join(dist, 'art', f)).toString('base64')}`
})

writeFileSync(join(dist, 'preview.html'), html)
console.log(`dist/preview.html ${(html.length / 1024).toFixed(0)} KB`)
