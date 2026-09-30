<script setup lang="ts">
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

    <UToaster />
  </div>
</template>
