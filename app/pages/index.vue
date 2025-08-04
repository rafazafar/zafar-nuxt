<script setup lang="ts">
const { locale } = useI18n()

const { data: page } = await useAsyncData(`index-${locale.value}`, async () => {
  const collection = `content_${locale.value}` as keyof Collections
  const allContent = await queryCollection(collection).all()
  // Look for index.yml specifically
  return allContent.find(item => 
    item._source?.includes('index.yml') || 
    item.title?.includes("Hey, I'm Zafar") ||
    (item._path && !item._path.includes('/blog/') && !item._path.includes('/projects/'))
  )
})

if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page not found',
    fatal: true
  })
}

useSeoMeta({
  title: page.value?.seo?.title || page.value?.title,
  ogTitle: page.value?.seo?.title || page.value?.title,
  description: page.value?.seo?.description || page.value?.description,
  ogDescription: page.value?.seo?.description || page.value?.description
})
</script>

<template>
  <UPage v-if="page">
    <LandingHero :page />
    <UPageSection
      :ui="{
        container: '!pt-0 lg:grid lg:grid-cols-2 lg:gap-8'
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
