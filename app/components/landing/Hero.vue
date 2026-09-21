<script setup lang="ts">
import type { ContentEnCollectionItem } from '@nuxt/content'

const { footer, global } = useAppConfig()

defineProps<{
  page: ContentEnCollectionItem
}>()

const motto = "Don't Stop Building"
</script>

<template>
  <UPageHero
    v-if="page"
    class="paper-grain"
    :ui="{
      container: 'py-16 sm:py-20 lg:py-24 relative z-[2]',
      headline: 'flex items-center justify-center',
      title: 'text-shadow-md max-w-lg mx-auto tracking-tight text-[clamp(2.25rem,5vw,3.25rem)]',
      description: 'mt-3 text-[1.05rem] leading-relaxed mx-auto max-w-2xl text-pretty text-muted',
      links: 'mt-5 flex-col justify-center items-center'
    }"
  >
    <template #headline>
      <Motion
        :initial="{ scale: 1.05, opacity: 0, filter: 'blur(12px)' }"
        :animate="{ scale: 1, opacity: 1, filter: 'blur(0px)' }"
        :transition="{ duration: 0.55, delay: 0.05 }"
      >
        <UColorModeAvatar
          class="size-16 sm:size-[4.5rem] ring-1 ring-black/10 dark:ring-white/15 ring-offset-2 ring-offset-(--ui-bg)"
          :light="global.picture?.light!"
          :dark="global.picture?.dark!"
          :alt="global.picture?.alt!"
        />
      </Motion>
    </template>

    <template #title>
      <Motion
        :initial="{ scale: 1.04, opacity: 0, filter: 'blur(12px)' }"
        :animate="{ scale: 1, opacity: 1, filter: 'blur(0px)' }"
        :transition="{ duration: 0.55, delay: 0.1 }"
      >
        {{ page.title }}
      </Motion>
    </template>

    <template #description>
      <Motion
        :initial="{ opacity: 0, y: 8 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.22 }"
        class="flex flex-col items-center gap-3"
      >
        <p class="motto-breathe text-sm sm:text-[0.95rem] font-medium text-highlighted uppercase">
          {{ motto }}
        </p>
        <p class="text-[1.05rem] leading-relaxed text-muted max-w-2xl text-pretty">
          {{ page.description }}
        </p>
      </Motion>
    </template>

    <template #links>
      <Motion
        :initial="{ opacity: 0, y: 8 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.38 }"
      >
        <div
          v-if="page.hero.links"
          class="flex flex-wrap items-center justify-center gap-3"
        >
          <UButton
            v-bind="page.hero.links[0]"
            color="neutral"
            class="resume-tactile min-h-11 px-5"
          />
          <UButton
            :color="global.available ? 'primary' : 'error'"
            variant="ghost"
            class="gap-2 min-h-11"
            :to="global.available ? `mailto:${global.email || 'hello@zafar.dev'}` : undefined"
            :label="global.available ? $t('common.availableForProjects') : $t('common.notAvailableAtMoment')"
          >
            <template #leading>
              <span class="relative flex size-2">
                <span
                  class="absolute inline-flex size-full rounded-full"
                  :class="global.available ? 'bg-primary avail-pulse' : 'bg-error'"
                />
                <span
                  class="relative inline-flex size-2 scale-90 rounded-full"
                  :class="global.available ? 'bg-primary' : 'bg-error'"
                />
              </span>
            </template>
          </UButton>
        </div>
      </Motion>

      <div class="gap-x-3 inline-flex mt-4">
        <Motion
          v-for="(link, index) of footer?.links"
          :key="index"
          :initial="{ opacity: 0, y: 6 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.45, delay: 0.48 + index * 0.08 }"
        >
          <UButton
            v-bind="{ size: 'md', color: 'neutral', variant: 'ghost', ...link }"
            class="min-h-11 min-w-11"
          />
        </Motion>
      </div>

      <LandingProjectStage
        v-if="page.hero.images?.length"
        :images="page.hero.images"
      />
    </template>
  </UPageHero>
</template>
