<script setup lang="ts">
import type { ContentEnCollectionItem } from '@nuxt/content'

defineProps<{
  page: ContentEnCollectionItem
}>()

const { footer, global } = useAppConfig()
const localePath = useLocalePath()

const reduceMotion = ref(false)
onMounted(() => {
  reduceMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
})

const ease = [0.22, 1, 0.36, 1] as const
function motion(delayMs: number) {
  if (reduceMotion.value) {
    return {
      initial: { opacity: 1, transform: 'translateY(0px)' },
      animate: { opacity: 1, transform: 'translateY(0px)' },
      transition: { duration: 0 }
    }
  }
  return {
    initial: { opacity: 0, transform: 'translateY(8px)' },
    animate: { opacity: 1, transform: 'translateY(0px)' },
    transition: { duration: 0.24, delay: delayMs / 1000, ease }
  }
}
</script>

<template>
  <UPageHero
    v-if="page"
    :ui="{
      container: 'py-16 sm:py-20 lg:py-24',
      title: '!mx-0 text-left max-w-3xl text-pretty text-[clamp(1.75rem,4vw,2.5rem)] font-bold',
      description: '!mx-0 text-left max-w-3xl',
      links: 'justify-start'
    }"
  >
    <template #headline>
      <Motion v-bind="motion(0)">
        <UColorModeAvatar
          class="size-14 sm:size-16 ring ring-default ring-offset-3 ring-offset-(--ui-bg)"
          :light="global.picture?.light!"
          :dark="global.picture?.dark!"
          :alt="global.picture?.alt!"
        />
      </Motion>
    </template>

    <template #title>
      <Motion v-bind="motion(40)">
        Tokyo-based Tech Lead — I ship products and production AI with real controls.
      </Motion>
    </template>

    <template #description>
      <Motion v-bind="motion(80)">
        <div class="space-y-3 max-w-[40ch]">
          <p class="text-base sm:text-lg text-muted">
            English-first. Startups and enterprise. Edge, mobile/BLE, and AI systems you can audit.
          </p>
          <p class="text-sm text-muted">
            <span class="font-medium text-highlighted">Not a fit:</span>
            Japanese-only corporate SES · prompt-only demos · logo-only brand work.
          </p>
        </div>
      </Motion>
    </template>

    <template #links>
      <Motion v-bind="motion(120)">
        <div class="flex flex-col items-start gap-6 w-full">
          <div class="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
            <UButton
              :to="global.meetingLink"
              label="Book a scoping call"
              color="primary"
              size="lg"
              target="_blank"
              class="min-h-11 min-w-[120px] justify-center"
            />
            <UButton
              :to="`mailto:${global.email}`"
              :label="global.email"
              color="neutral"
              variant="outline"
              size="lg"
              class="min-h-11 min-w-[120px] justify-center"
            />
          </div>
          <p class="text-sm text-muted max-w-xl">
            One-stop digital factory — controls when you need AI, craft when you need the product to feel human.
          </p>
          <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <NuxtLink
              :to="localePath('/services/ai-systems')"
              class="font-medium text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary"
            >
              AI systems
            </NuxtLink>
            <span class="text-muted">·</span>
            <NuxtLink
              :to="localePath('/services/product-craft')"
              class="font-medium text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary"
            >
              Product craft
            </NuxtLink>
          </div>
          <div class="inline-flex gap-x-3">
            <UButton
              v-for="(link, index) of footer?.links"
              :key="index"
              v-bind="{ size: 'sm', color: 'neutral', variant: 'ghost', ...link }"
            />
          </div>
        </div>
      </Motion>
    </template>
  </UPageHero>
</template>
