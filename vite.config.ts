import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // `--mode pages` builds for GitHub Pages at /new-media/ so every page has a real address.
  base: mode === 'pages' ? '/new-media/' : './',
  plugins: [react(), tailwindcss()],
  // `--mode single` bundles everything into one script for the single-file preview.
  build:
    mode === 'single'
      ? { assetsInlineLimit: 1_000_000, rolldownOptions: { output: { inlineDynamicImports: true } } }
      : {},
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
}))
