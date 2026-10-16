import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages serves the site from https://makingmeans.github.io/codeforces-tracker/,
// so every asset has to be resolved against that sub-path.
export default defineConfig({
  base: '/codeforces-tracker/',
  plugins: [react(), tailwindcss()],
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
