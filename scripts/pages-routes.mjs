// After `vite build --mode pages`: give every page its own index.html so
// GitHub Pages serves /new-media/work/ and friends directly, and add a 404.html
// that loads the app for any other path. Adds .nojekyll so _-prefixed files are served.
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dist = 'dist'
for (const route of ['work', 'services', 'how-it-works', 'contact']) {
  mkdirSync(join(dist, route), { recursive: true })
  copyFileSync(join(dist, 'index.html'), join(dist, route, 'index.html'))
}
copyFileSync(join(dist, 'index.html'), join(dist, '404.html'))
writeFileSync(join(dist, '.nojekyll'), '')
console.log('pages routes written')
