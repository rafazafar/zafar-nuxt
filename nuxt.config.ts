// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint",
    "@nuxt/image",
    "@nuxt/ui-pro",
    "@nuxt/content",
    "@vueuse/nuxt",
    "nuxt-og-image",
    "motion-v/nuxt",
  ],

  devtools: {
    enabled: true,
  },

  css: ["~/assets/css/main.css"],

  future: {
    compatibilityVersion: 4,
  },

  compatibilityDate: "2024-11-01",

  nitro: {
    preset: "cloudflare-module",
    routeRules: {
      "/blog/**": { ssr: false },
      "/blog/*": { ssr: false },
    },
    prerender: {
      routes: ["/", "/blog"],
      crawlLinks: true,
    },
    experimental: {
      openAPI: true,
    },
    openAPI: {
      production: "runtime",
      ui: {
        scalar: {
          theme: "cyan",
        },
      },
    },
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: "never",
        braceStyle: "1tbs",
      },
    },
  },
});
