// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui-pro',
    '@nuxt/content',
    '@vueuse/nuxt',
    'nuxt-og-image',
    'motion-v/nuxt',
    '@nuxtjs/i18n'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  future: {
    compatibilityVersion: 4
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
      '/blog/*': { ssr: false, static: true }
    },
    prerender: {
      routes: ['/', '/blog'],
      crawlLinks: true
    }
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
