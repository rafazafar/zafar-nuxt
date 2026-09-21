<script setup lang="ts">
import type { ContentEnCollectionItem } from '@nuxt/content'

const props = defineProps<{
  page: ContentEnCollectionItem
}>()

const questions = computed(() => {
  const cats = props.page?.faq?.categories ?? []
  return cats.flatMap((cat: { questions?: { label: string, content: string }[] }) => cat.questions ?? [])
})
</script>

<template>
  <UPageSection
    v-if="page?.faq && questions.length"
    :title="page.faq.title"
    :description="page.faq.description"
    :ui="{
      container: 'px-0 !pt-0 gap-4 sm:gap-4',
      title: 'text-left text-xl sm:text-xl lg:text-2xl font-medium',
      description: 'text-left mt-2 text-sm sm:text-md lg:text-sm text-muted'
    }"
  >
    <UAccordion
      :unmount-on-hide="false"
      trailing-icon="lucide:plus"
      :items="questions"
      :ui="{
        item: 'border-none',
        trigger: 'mb-2 border-0 group px-4 transform-gpu rounded-lg bg-elevated/60 will-change-transform hover:bg-muted/50 min-h-11',
        trailingIcon: 'group-data-[state=closed]:rotate-0 group-data-[state=open]:rotate-135'
      }"
    >
      <template #body="{ item }">
        <MDC
          :value="(item as { content: string }).content"
          unwrap="p"
          class="px-4 pb-2 text-sm sm:text-base text-muted"
        />
      </template>
    </UAccordion>
  </UPageSection>
</template>
