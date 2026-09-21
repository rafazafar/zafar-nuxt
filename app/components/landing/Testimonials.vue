<script setup lang="ts">
import type { ContentEnCollectionItem } from '@nuxt/content'

defineProps<{
  page: ContentEnCollectionItem
}>()
</script>

<template>
  <UPageSection
    v-if="page?.testimonials?.length"
    :title="$t('home.notesFromPeople')"
    :ui="{
      container: 'px-0 !pt-2 gap-6 sm:gap-8',
      title: 'text-left text-xl sm:text-xl lg:text-2xl font-medium',
      description: 'text-left'
    }"
  >
    <div class="grid gap-6 sm:gap-8 md:grid-cols-2">
      <figure
        v-for="(item, index) in page.testimonials"
        :key="index"
        class="relative rounded-2xl border border-default/60 bg-elevated/30 px-5 py-6 sm:px-6"
      >
        <blockquote class="text-base sm:text-lg leading-relaxed text-highlighted italic text-pretty">
          “{{ item.quote }}”
        </blockquote>
        <figcaption class="mt-5 flex items-center gap-3">
          <UUser
            v-bind="item.author"
            size="md"
          />
        </figcaption>
      </figure>
    </div>
  </UPageSection>
</template>
