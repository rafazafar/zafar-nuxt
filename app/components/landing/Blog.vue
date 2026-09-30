<script setup lang="ts">
import type { IndexPage } from '~/utils/content'
// Written by blog/build.mjs from blog/posts/<lang>/*.md
import latest from '~/data/blog-latest.json'

defineProps<{
  page: IndexPage
}>()

const { locale } = useI18n()

const posts = computed(() => (latest as Record<string, typeof latest.en>)[locale.value] ?? latest.en)
</script>

<template>
  <UPageSection
    v-if="page?.blog"
    :title="page.blog.title"
    :description="page.blog.description"
    :ui="{
      container: 'px-0 !pt-0 sm:gap-6 lg:gap-8',
      title: 'text-left text-xl sm:text-xl lg:text-2xl font-medium',
      description: 'text-left mt-2 text-sm sm:text-md lg:text-sm text-muted'
    }"
  >
    <UBlogPosts
      orientation="vertical"
      class="gap-4 lg:gap-y-4"
    >
      <UBlogPost
        v-for="post in posts"
        :key="post.path"
        orientation="horizontal"
        variant="naked"
        :title="post.title"
        :description="post.description"
        :date="post.date"
        :image="post.image"
        :to="post.path"
        external
        :ui="{
          root: 'group relative lg:items-start lg:flex ring-0 hover:ring-0',
          body: '!px-0',
          header: 'hidden'
        }"
      >
        <template #footer>
          <UButton
            size="xs"
            variant="link"
            class="px-0 gap-0"
            label="Read Article"
          >
            <template #trailing>
              <UIcon
                name="i-lucide-arrow-right"
                class="size-4 text-primary transition-all opacity-0 group-hover:translate-x-1 group-hover:opacity-100"
              />
            </template>
          </UButton>
        </template>
      </UBlogPost>
    </UBlogPosts>
  </UPageSection>
</template>
