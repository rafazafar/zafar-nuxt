<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

defineProps<{
  links: NavigationMenuItem[]
}>()

const open = ref(false)
const route = useRoute()

watch(() => route.fullPath, () => {
  open.value = false
})
</script>

<template>
  <div class="fixed top-2 sm:top-4 inset-x-0 z-50 flex justify-center px-3 pointer-events-none">
    <!-- Desktop / md+ pill nav -->
    <UNavigationMenu
      :items="links"
      variant="link"
      color="neutral"
      class="pointer-events-auto hidden md:flex bg-muted/80 backdrop-blur-sm rounded-full px-4 border border-muted/50 shadow-lg shadow-neutral-950/5 max-w-[calc(100vw-1.5rem)]"
      :ui="{
        link: 'px-2 py-2 min-h-11',
        linkLeadingIcon: 'hidden'
      }"
    >
      <template #list-leading>
        <UContentSearchButton size="sm" class="min-h-11 min-w-11" />
      </template>
      <template #list-trailing>
        <LanguageSelector />
        <ColorModeButton />
      </template>
    </UNavigationMenu>

    <!-- Mobile bar -->
    <div class="pointer-events-auto md:hidden flex items-center gap-2 w-full max-w-lg bg-muted/90 backdrop-blur-sm rounded-full px-2 py-1.5 border border-muted/50 shadow-lg shadow-neutral-950/5 safe-area-pad">
      <UContentSearchButton size="sm" class="min-h-11 min-w-11 shrink-0" />
      <div class="flex-1" />
      <LanguageSelector />
      <ColorModeButton />
      <UButton
        color="neutral"
        variant="ghost"
        square
        class="min-h-11 min-w-11 shrink-0"
        :icon="open ? 'i-lucide-x' : 'i-lucide-menu'"
        :aria-label="open ? 'Close menu' : 'Open menu'"
        :aria-expanded="open"
        @click="open = !open"
      />
    </div>

    <USlideover
      v-model:open="open"
      side="right"
      :ui="{
        overlay: 'md:hidden',
        content: 'md:hidden w-[min(100vw,20rem)] max-w-full'
      }"
    >
      <template #header>
        <div class="flex items-center justify-between w-full px-1">
          <span class="font-medium text-highlighted">Menu</span>
          <UButton
            color="neutral"
            variant="ghost"
            square
            class="min-h-11 min-w-11"
            icon="i-lucide-x"
            aria-label="Close menu"
            @click="open = false"
          />
        </div>
      </template>
      <template #body>
        <nav class="flex flex-col gap-1 p-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <UButton
            v-for="link in links"
            :key="String(link.to)"
            :to="link.to"
            :label="link.label"
            :icon="link.icon"
            color="neutral"
            variant="ghost"
            size="lg"
            block
            class="justify-start min-h-11 px-4"
            @click="open = false"
          />
        </nav>
      </template>
    </USlideover>
  </div>
</template>
