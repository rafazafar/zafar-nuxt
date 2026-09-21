<script setup lang="ts">
const { footer, global } = useAppConfig()
const localePath = useLocalePath()
</script>

<template>
  <UFooter
    class="z-10 bg-default"
    :ui="{ left: 'text-xs', right: 'flex flex-wrap items-center justify-end gap-1' }"
  >
    <template #left>
      {{ $t('common.copyright') }}
    </template>

    <template #right>
      <UButton
        :to="localePath('/services/ai-systems')"
        label="AI systems"
        size="xs"
        color="neutral"
        variant="ghost"
        class="min-h-11"
      />
      <UButton
        :to="localePath('/services/product-craft')"
        label="Product craft"
        size="xs"
        color="neutral"
        variant="ghost"
        class="min-h-11"
      />
      <UButton
        :to="global.meetingLink"
        label="Book a scoping call"
        size="xs"
        color="neutral"
        variant="ghost"
        target="_blank"
        class="min-h-11"
      />
      <UButton
        :to="`mailto:${global.email}`"
        :label="global.email"
        size="xs"
        color="neutral"
        variant="ghost"
        class="min-h-11"
      />
      <template v-if="footer?.links">
        <UButton
          v-for="(link, index) of footer?.links"
          :key="index"
          v-bind="{ size: 'xs', color: 'neutral', variant: 'ghost', class: 'min-h-11 min-w-11', ...link }"
        />
      </template>
    </template>
  </UFooter>
</template>
