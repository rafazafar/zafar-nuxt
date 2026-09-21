<script setup lang="ts">
const localePath = useLocalePath()

const chips = [
  {
    title: 'Wearable / BLE 2026',
    description: 'Realtime BLE + MQTT5 monitoring — reconnect evidence, not demos'
  },
  {
    title: 'AXA tools',
    description: 'Internal tools for legacy Japanese ETL introspection'
  },
  {
    title: 'Seekers',
    description: 'Multi-tenant crowdsourced recruitment — founding build'
  }
]
</script>

<template>
  <UPageSection
    :ui="{
      container: '!pt-0 !pb-4'
    }"
  >
    <p class="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
      Selected work
    </p>
    <div class="grid gap-3 md:grid-cols-3">
      <NuxtLink
        v-for="chip in chips"
        :key="chip.title"
        :to="localePath('/projects')"
        class="group flex items-start gap-3 rounded-xl border border-default px-4 py-3 min-h-11 transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        <div class="min-w-0 flex-1">
          <p class="font-semibold text-highlighted truncate">
            {{ chip.title }}
          </p>
          <p class="text-sm text-muted truncate">
            {{ chip.description }}
          </p>
        </div>
        <UIcon
          name="i-lucide-chevron-right"
          class="size-4 shrink-0 mt-1 text-muted group-hover:text-primary"
        />
      </NuxtLink>
    </div>
  </UPageSection>
</template>
