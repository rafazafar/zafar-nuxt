<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  description?: string
  showServiceLinks?: boolean
}>(), {
  title: 'Ship with real controls — or craft people can feel.',
  description: '',
  showServiceLinks: true
})

const { global } = useAppConfig()
const localePath = useLocalePath()
</script>

<template>
  <UPageSection
    :ui="{
      container: 'py-12 sm:py-16'
    }"
    class="border-t border-default"
  >
    <div class="rounded-2xl bg-elevated/50 p-6 sm:p-10">
      <h2 class="max-w-2xl text-2xl font-semibold tracking-tight text-highlighted sm:text-3xl">
        {{ title }}
      </h2>
      <p
        v-if="description"
        class="mt-4 max-w-3xl text-base leading-7 text-muted sm:text-lg"
      >
        {{ description }}
      </p>
      <div class="mt-7 flex flex-wrap items-center gap-3">
        <UButton
          :to="global.meetingLink"
          label="Book a scoping call"
          color="primary"
          size="lg"
          target="_blank"
          class="min-h-11 min-w-[120px]"
        />
        <UButton
          :to="`mailto:${global.email}`"
          :label="global.email"
          color="neutral"
          variant="outline"
          size="lg"
          class="min-h-11 min-w-[120px]"
        />
      </div>
      <p
        v-if="showServiceLinks"
        class="mt-6 text-sm text-muted"
      >
        <NuxtLink
          :to="localePath('/services/ai-systems')"
          class="font-medium text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary"
        >
          AI systems
        </NuxtLink>
        <span class="mx-2">·</span>
        <NuxtLink
          :to="localePath('/services/product-craft')"
          class="font-medium text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary"
        >
          Product craft
        </NuxtLink>
      </p>
    </div>
  </UPageSection>
</template>
