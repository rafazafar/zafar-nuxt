<script setup lang="ts">
const { global } = useAppConfig()
const localePath = useLocalePath()

useSeoMeta({
  title: 'Services | Zafar',
  description: 'One-stop digital factory. Pick the door — or use both.'
})

const cards = [
  {
    title: 'AI systems',
    body: 'Production AI with human gates, allowlists, and audit trails — designed toward real control concepts, not demo theater.',
    to: '/services/ai-systems'
  },
  {
    title: 'Product craft',
    body: 'Bespoke product UI and interaction that feels human — and ships. Taste without agency theater.',
    to: '/services/product-craft'
  }
]
</script>

<template>
  <UPage>
    <UPageHero
      title="Services"
      description="One-stop digital factory. Pick the door — or use both."
      :ui="{
        container: 'py-16 sm:py-20 lg:py-24',
        title: '!mx-0 text-left',
        description: '!mx-0 text-left'
      }"
    />
    <UPageSection :ui="{ container: '!pt-0' }">
      <div class="grid gap-4 md:grid-cols-2">
        <UPageCard
          v-for="card in cards"
          :key="card.title"
          :title="card.title"
          :description="card.body"
          :to="localePath(card.to)"
          variant="outline"
          class="min-h-11"
        />
      </div>
      <div class="mt-10 flex flex-wrap items-center gap-3">
        <UButton
          :to="global.meetingLink"
          label="Book a scoping call"
          color="primary"
          size="lg"
          target="_blank"
          class="min-h-11"
        />
        <UButton
          :to="`mailto:${global.email}`"
          :label="global.email"
          color="neutral"
          variant="outline"
          size="lg"
          class="min-h-11"
        />
      </div>
    </UPageSection>
  </UPage>
</template>
