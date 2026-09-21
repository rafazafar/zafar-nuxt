<script setup lang="ts">
import type { Collections, BlogCollectionItem } from '@nuxt/content'

const { locale } = useI18n()
const localePath = useLocalePath()

const pageCollection = computed(() =>
  (locale.value === 'en' ? 'blog_page' : `blog_page_${locale.value}`) as keyof Collections
)
const postsCollection = computed(() =>
  (locale.value === 'en' ? 'blog' : `blog_${locale.value}`) as keyof Collections
)

const { data: page } = await useAsyncData(
  () => `blog-hub-${locale.value}`,
  async () => queryCollection(pageCollection.value).first(),
  { watch: [locale] }
)

if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Blog page not found',
    fatal: true
  })
}

const { data: posts } = await useAsyncData(
  () => `blog-posts-${locale.value}`,
  async () => {
    const all = await queryCollection(postsCollection.value).all() as BlogCollectionItem[]
    return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  },
  { watch: [locale] }
)

useSeoMeta({
  title: page.value?.seo?.title || page.value?.title || 'Blog',
  ogTitle: page.value?.seo?.title || page.value?.title || 'Blog',
  description: page.value?.seo?.description || page.value?.description,
  ogDescription: page.value?.seo?.description || page.value?.description
})
</script>

<template>
  <UPage v-if="page">
    <UPageHero
      :title="page.title"
      :description="page.description"
      :ui="{
        container: 'py-16 sm:py-20 lg:py-24',
        title: '!mx-0 text-left',
        description: '!mx-0 text-left'
      }"
    />
    <UPageSection
      :ui="{
        container: '!pt-0 !pb-16'
      }"
    >
      <UBlogPosts
        v-if="posts?.length"
        orientation="vertical"
      >
        <Motion
          v-for="(post, index) in posts"
          :key="post.path"
          :initial="{ opacity: 0, transform: 'translateY(10px)' }"
          :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
          :transition="{ delay: 0.1 * index }"
          :in-view-options="{ once: true }"
        >
          <UBlogPost
            variant="naked"
            orientation="horizontal"
            :to="localePath(post.path)"
            v-bind="post"
            :ui="{
              root: 'md:grid md:grid-cols-2 group overflow-visible transition-all duration-300',
              image: 'group-hover/blog-post:scale-105 rounded-lg shadow-lg border-4 border-muted ring-2 ring-default',
              header: index % 2 === 0
                ? 'sm:-rotate-1 overflow-visible'
                : 'sm:rotate-1 overflow-visible'
            }"
          />
        </Motion>
      </UBlogPosts>
      <p
        v-else
        class="text-muted"
      >
        No posts yet.
      </p>
    </UPageSection>
  </UPage>
</template>
