<script setup lang="ts">
const colorMode = useColorMode()

const color = computed(() => colorMode.value === 'dark' ? '#020618' : 'white')

useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

useSeoMeta({
  ogImage: 'https://r2.zafar.dev/img/web-og.png',
  ogDescription: 'My primary focus is on creating useful and impactful products that make a real difference in people\'s lives. Over the course of my career, I gained extensive experience in designing, simplifying, coding and scaling various processes and solutions for startups, which has helped me develop a strong track record of success in achieving clients\' goals and objectives.',
  titleTemplate: '%s - Zafar Portfolio',
  twitterCard: 'summary_large_image'
})

const { locale } = useI18n()

const [{ data: navigation }, { data: files }] = await Promise.all([
  useAsyncData(`navigation-${locale.value}`, () => {
    const collection = `content_${locale.value}` as keyof Collections
    return Promise.all([
      queryCollectionNavigation(collection)
    ])
  }, {
    transform: data => data.flat()
  }),
  useLazyAsyncData(`search-${locale.value}`, () => {
    const collection = `content_${locale.value}` as keyof Collections
    return Promise.all([
      queryCollectionSearchSections(collection)
    ])
  }, {
    server: false,
    transform: data => data.flat()
  })
])
</script>

<template>
  <UApp>
    <NuxtLayout>
      <UMain class="relative">
        <NuxtPage />
      </UMain>
    </NuxtLayout>

    <ClientOnly>
      <LazyUContentSearch
        :files="files"
        :navigation="navigation"
        shortcut="meta_k"
        :links="useNavLinks()"
        :fuse="{ resultLimit: 42 }"
      />
    </ClientOnly>
  </UApp>
</template>
