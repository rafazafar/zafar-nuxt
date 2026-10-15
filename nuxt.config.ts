// https://nuxt.com/docs/api/configuration/nuxt-config
import { parse as parseYaml } from 'yaml'
import { marked } from 'marked'

// Markdown `content:` fields in content/*.yml are rendered to HTML at build time (as `contentHtml`),
// so the Worker never runs a Markdown parser per request.
function addContentHtml(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(addContentHtml)
  if (node && typeof node === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(node)) out[k] = addContentHtml(v)
    if (typeof out.content === 'string') out.contentHtml = marked.parse(out.content, { async: false })
    return out
  }
  return node
}

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@vueuse/nuxt',
    'nuxt-og-image',
    'motion-v/nuxt',
    '@nuxtjs/i18n'
  ],

  devtools: {
    enabled: process.env.NODE_ENV === 'development'
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/about': { prerender: true },
    '/projects': { prerender: true },
    '/speaking': { prerender: true },
    '/services/**': { prerender: true },
    '/ja/**': { prerender: true },
    '/de/**': { prerender: true }
  },

  compatibilityDate: '2026-05-26',

  nitro: {
    preset: 'cloudflare_module',
    sourceMap: false,
    minify: true,
    cloudflare: {
      deployConfig: false,
      nodeCompat: true
    },
    // All Nuxt pages are prerendered to static HTML (content is bundled YAML, nothing is per-request),
    // so Cloudflare serves them as assets without invoking the Worker (free plan: 10ms CPU limit).
    // The English homepage (public/index.html) and the blog (public/blog) are hand-written/static already,
    // so '/' is NOT prerendered by Nuxt (it would overwrite public/index.html).
    prerender: {
      crawlLinks: true,
      failOnError: false,
      ignore: [/^\/$/, /^\/(ja\/|de\/)?blog(\/|$)/],
      routes: [
        '/about', '/projects', '/speaking', '/services/ai-systems', '/services/product-craft',
        '/ja', '/ja/about', '/ja/projects', '/ja/speaking', '/ja/services/ai-systems', '/ja/services/product-craft',
        '/de', '/de/about', '/de/projects', '/de/speaking', '/de/services/ai-systems', '/de/services/product-craft'
      ]
    }
  },

  vite: {
    plugins: [{
      // lets app/utils/content.ts import the YAML in content/ as plain objects
      name: 'yaml',
      transform(code, id) {
        if (id.endsWith('.yml') || id.endsWith('.yaml')) return { code: `export default ${JSON.stringify(addContentHtml(parseYaml(code)))}`, map: null }
      }
    }],
    build: {
      sourcemap: false,
      chunkSizeWarningLimit: 1000
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
  },

  ogImage: {
    zeroRuntime: true
  }
})
