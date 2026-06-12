import { defineNitroConfig } from 'nitropack/config'

export default defineNitroConfig({
  compatibilityDate: '2024-09-19',
  preset: 'cloudflare_module',
  cloudflare: {
    deployConfig: true,
    nodeCompat: true,
    wrangler: {
      observability: {
        logs: {
          enabled: true
        }
      }
    }
  },
  routeRules: {
    '/blog/*': { ssr: false, static: true },
    '/__nuxt_content/**': { prerender: false, robots: false }
  },
  minify: true
})
