<script setup lang="ts">
const colorMode = useColorMode()
const { locale } = useI18n()

const color = computed(() => colorMode.value === 'dark' ? '#020618' : 'white')

useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale: 1' },
    { key: 'theme-color', name: 'theme-color', content: color }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: () => locale.value
  }
})

useSeoMeta({
  ogImage: 'https://r2.zafar.dev/img/web-og.png',
  ogDescription: 'My primary focus is on creating useful and impactful products that make a real difference in people\'s lives. Over the course of my career, I gained extensive experience in designing, simplifying, coding and scaling various processes and solutions for startups, which has helped me develop a strong track record of success in achieving clients\' goals and objectives.',
  titleTemplate: '%s - Zafar Portfolio',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <!-- Codex box smoke test 2026-09-21 -->
  <UApp>
    <NuxtLayout>
      <UMain class="relative">
        <NuxtPage />
      </UMain>
    </NuxtLayout>
  </UApp>
</template>
