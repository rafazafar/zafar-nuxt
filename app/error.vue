<script setup lang="ts">
import type { Collections } from '@nuxt/content'
import type { NuxtError } from '#app'

defineProps({
  error: {
    type: Object as PropType<NuxtError>,
    required: true
  }
})

const { t, locale } = useI18n()

useHead({
  htmlAttrs: {
    lang: () => locale.value
  }
})

useSeoMeta({
  title: t('common.pageNotFound'),
  description: 'We are sorry but this page could not be found.'
})

const navLinks = useNavLinks()

const [{ data: navigation }, { data: files }] = await Promise.all([
  useAsyncData(`navigation-${locale.value}`, () => {
    const collection = `content_${locale.value}` as keyof Collections
    return Promise.all([
      queryCollectionNavigation(collection)
    ])
  }, {
    watch: [locale],
    transform: data => data.flat()
  }),
  useLazyAsyncData(`search-${locale.value}`, () => {
    const collection = `content_${locale.value}` as keyof Collections
    return Promise.all([
      queryCollectionSearchSections(collection)
    ])
  }, {
    server: false,
    watch: [locale],
    transform: data => data.flat()
  })
])
</script>

<template>
  <div>
    <AppHeader :links="navLinks" />

    <UMain>
      <UContainer>
        <UPage>
          <UError :error="error" />
        </UPage>
      </UContainer>
    </UMain>

    <AppFooter />

    <ClientOnly>
      <LazyUContentSearch
        :files="files"
        shortcut="meta_k"
        :navigation="navigation"
        :links="navLinks"
        :fuse="{ resultLimit: 42 }"
      />
    </ClientOnly>

    <UToaster />
  </div>
</template>
