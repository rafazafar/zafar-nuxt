<script setup lang="ts">
import type { ContentEnCollectionItem } from '@nuxt/content'

const { footer, global } = useAppConfig()

defineProps<{
  page: ContentEnCollectionItem
}>()

const motto = 'Don\'t Stop Building'
const mottoBreathe = ref(false)
const mottoSessionKey = 'zafar-motto-breathed'

onMounted(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  try {
    const firstMottoVisit = !window.sessionStorage.getItem(mottoSessionKey)
    window.sessionStorage.setItem(mottoSessionKey, '1')
    mottoBreathe.value = firstMottoVisit && !reduced
  } catch {
    mottoBreathe.value = !reduced
  }
})
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
      links: 'mt-5 flex w-full min-w-0 flex-col items-center justify-center'
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
        <p
          class="motto-copy text-sm sm:text-[0.95rem] font-medium text-highlighted uppercase"
          :class="{ 'motto-breathe': mottoBreathe }"
        >
          {{ motto }}
        </p>
        <p class="text-[1.05rem] leading-relaxed text-muted max-w-2xl text-pretty">
          {{ page.description }}
        </p>
      </Motion>
    </template>

    <template #links>
      <div class="flex w-full min-w-0 flex-col items-center gap-8 md:gap-10">
        <div class="flex flex-col items-center gap-4">
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
                class="resume-tactile min-h-11 px-5 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-(--ui-bg)"
              />
              <UButton
                :color="global.available ? 'primary' : 'error'"
                variant="ghost"
                class="min-h-11 gap-2"
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

          <div class="inline-flex gap-x-3">
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
        </div>

        <LandingProjectStage
          v-if="page.hero.images?.length"
          :images="page.hero.images"
        />
      </div>
    </template>
  </UPageHero>
</template>
