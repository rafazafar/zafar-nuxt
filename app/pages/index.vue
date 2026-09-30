<script setup lang="ts">
const { locale } = useI18n()

useHead({
  htmlAttrs: {
    class: 'home-lock-x'
  }
})

const page = computed(() => getPage(locale.value, 'index'))

useSeoMeta({
  title: page.value?.seo?.title || page.value?.title,
  ogTitle: page.value?.seo?.title || page.value?.title,
  description: page.value?.seo?.description || page.value?.description,
  ogDescription: page.value?.seo?.description || page.value?.description
})
</script>

<template>
  <UPage
    v-if="page"
    class="home-page min-w-0 overflow-x-hidden"
  >
    <LandingHero :page />
    <UPageSection
      :ui="{
        container: '!pt-0 !pb-7 lg:!pb-32 lg:grid lg:grid-cols-2 lg:gap-8'
      }"
    >
      <LandingAbout :page />
      <LandingWorkExperience :page />
    </UPageSection>
    <LandingBlog :page />
    <LandingTestimonials :page />
    <LandingFAQ :page />
  </UPage>
</template>
