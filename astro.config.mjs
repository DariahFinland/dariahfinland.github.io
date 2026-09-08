import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  site: 'https://dariah-fi-astro.dariah-finland.workers.dev'
})
