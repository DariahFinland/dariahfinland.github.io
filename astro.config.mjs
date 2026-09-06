import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import node from '@astrojs/node'

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  site: 'https://dariahfinland.github.io', // TODO: update once Rahti's route/domain is known
  output: 'server',
  adapter: node({ mode: 'standalone' }),
})
