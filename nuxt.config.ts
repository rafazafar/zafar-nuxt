// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui-pro',
    '@nuxt/content',
    '@vueuse/nuxt',
    // 'nuxt-og-image',
    'motion-v/nuxt',
    '@nuxtjs/i18n',
    // Dev-only modules excluded from production builds
    // '@nuxt/kit'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  vite: {
    build: {
      // Saves memory + faster builds on Cloudflare (sourcemaps are rarely needed in prod)
      sourcemap: false,
      // You can tune this if you keep getting chunk warnings
      chunkSizeWarningLimit: 1000
    }
  },

  compatibilityDate: '2025-04-01',

  nitro: {
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
      // Prevent OOM on Cloudflare Pages: @nuxt/content v3 auto-prerenders massive
      // full SQLite dumps (/__nuxt_content/*/sql_dump.txt) for every collection.
      // These are only needed for the optional LLM/llms.txt export feature.
      '/__nuxt_content/**': { prerender: false, robots: false }
    },
    // Reduce memory pressure during the heavy cloudflare-module server bundling
    minify: true
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  i18n: {
    locales: [
      {
        code: 'en',
        iso: 'en-US',
        name: 'English',
        file: 'en.json'
      },
      {
        code: 'ja',
        iso: 'ja-JP',
        name: '日本語',
        file: 'ja.json'
      },
      {
        code: 'de',
        iso: 'de-DE',
        name: 'Deutsch',
        file: 'de.json'
      }
    ],
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root'
    }
  }
})
