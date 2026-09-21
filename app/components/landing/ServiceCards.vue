<script setup lang="ts">
const localePath = useLocalePath()

const cards = [
  {
    title: 'AI systems',
    body: 'Production AI with human gates, allowlists, and audit trails — designed toward real control concepts, not demo theater.',
    to: '/services/ai-systems',
    cta: 'View AI systems'
  },
  {
    title: 'Product craft',
    body: 'Bespoke product UI and interaction that feels human — and ships. Taste without agency theater.',
    to: '/services/product-craft',
    cta: 'View product craft'
  }
]
</script>

<template>
  <UPageSection
    :ui="{
      container: '!pt-0 !pb-8'
    }"
  >
    <div class="grid gap-3 md:grid-cols-2">
      <NuxtLink
        v-for="card in cards"
        :key="card.title"
        :to="localePath(card.to)"
        class="group flex flex-col gap-2 rounded-xl border border-default px-4 py-3 min-h-11 transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        <div class="flex items-start justify-between gap-3">
          <h3 class="font-semibold text-highlighted">
            {{ card.title }}
          </h3>
          <UIcon
            name="i-lucide-arrow-right"
            class="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
          />
        </div>
        <p class="text-sm text-muted">
          {{ card.body }}
        </p>
        <span class="text-sm font-medium text-primary">
          {{ card.cta }}
        </span>
      </NuxtLink>
    </div>
  </UPageSection>
</template>
