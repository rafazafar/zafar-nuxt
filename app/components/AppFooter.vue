<script setup lang="ts">
const { footer, global } = useAppConfig()
</script>

<template>
  <UFooter
    class="z-10 bg-default border-t border-default/40"
    :ui="{
      left: 'text-xs text-muted',
      center: 'text-xs text-muted',
      right: 'text-xs'
    }"
  >
    <template #left>
      <div class="flex flex-col gap-0.5">
        <span class="text-highlighted font-medium tracking-wide">Zafar · Don't Stop Building</span>
        <a
          class="hover:text-primary transition-colors"
          :href="`mailto:${global.email || 'hello@zafar.dev'}`"
        >{{ global.email || 'hello@zafar.dev' }}</a>
      </div>
    </template>

    <template #right>
      <template v-if="footer?.links">
        <UButton
          v-for="(link, index) of footer?.links"
          :key="index"
          v-bind="{ size: 'xs', color: 'neutral', variant: 'ghost', ...link }"
          class="min-h-11 min-w-11"
        />
      </template>
      <span class="text-muted ml-1">{{ $t('common.copyright') }}</span>
    </template>
  </UFooter>
</template>
