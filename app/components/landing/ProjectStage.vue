<script setup lang="ts">
export type StageImage = {
  src: string
  alt: string
  link?: string
  caption?: string
}

const props = defineProps<{
  images: StageImage[]
}>()

const localePath = useLocalePath()

const active = ref<number | null>(null)
const reduceMotion = ref(false)

onMounted(() => {
  reduceMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
})

const stageImages = computed(() => (props.images || []).slice(0, 5))

const rotations = [-3, 2.2, -1.4, 1.6, -2]
const driftClass = ['stage-drift-a', 'stage-drift-b', 'stage-drift-c', 'stage-drift-a', 'stage-drift-b']

const activeCaption = computed(() => {
  if (active.value === null) {
    return stageImages.value[0]?.caption || stageImages.value[0]?.alt || ''
  }
  const img = stageImages.value[active.value]
  return img?.caption || img?.alt || ''
})

function setActive(index: number | null) {
  active.value = index
}

function onFocus(index: number) {
  setActive(index)
}

function onBlur(event: FocusEvent) {
  const root = (event.currentTarget as HTMLElement).closest('[data-stage-root]')
  const next = event.relatedTarget as HTMLElement | null
  if (!next || !root?.contains(next)) {
    setActive(null)
  }
}
</script>

<template>
  <div
    data-stage-root
    class="w-full mt-10 sm:mt-14"
  >
    <!-- Desktop / md+: layered fan -->
    <div
      class="relative hidden md:block mx-auto max-w-[68rem] h-[17.5rem] lg:h-[19rem]"
      @mouseleave="setActive(null)"
    >
      <div
        v-for="(img, index) in stageImages"
        :key="img.src + index"
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        :style="{
          marginLeft: `${(index - (stageImages.length - 1) / 2) * 7.25}rem`,
          zIndex: active === index ? 40 : 10 + index
        }"
      >
        <NuxtLink
          :to="img.link ? localePath(img.link) : localePath('/projects')"
          class="stage-card group relative block w-[11.5rem] lg:w-[13rem] rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-(--ui-bg) transition-opacity duration-300 ease-out"
          :class="[
            !reduceMotion && active !== index ? driftClass[index % driftClass.length] : '',
            active !== null && active !== index ? 'is-dim' : '',
            active === index ? 'is-active' : ''
          ]"
          :style="{ '--stage-rot': `${rotations[index % rotations.length]}deg` }"
          :aria-label="img.caption || img.alt"
          @mouseenter="setActive(index)"
          @focus="onFocus(index)"
          @blur="onBlur"
        >
          <span class="stage-frame block overflow-hidden rounded-xl border border-black/10 bg-white dark:border-white/15 dark:bg-neutral-900">
            <img
              :src="img.src"
              :alt="img.alt"
              width="240"
              height="180"
              class="aspect-[4/3] w-full object-cover"
              loading="lazy"
            >
          </span>
        </NuxtLink>
      </div>
    </div>

    <!-- Mobile: snap carousel with peek -->
    <div
      class="md:hidden -mx-4 px-4 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 scroll-px-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <NuxtLink
        v-for="(img, index) in stageImages"
        :key="'m-' + img.src + index"
        :to="img.link ? localePath(img.link) : localePath('/projects')"
        class="snap-start shrink-0 w-[72vw] max-w-[16rem] rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-transform active:scale-[0.98]"
        :aria-label="img.caption || img.alt"
        @focus="onFocus(index)"
        @blur="onBlur"
        @click="setActive(index)"
      >
        <span class="stage-frame block overflow-hidden rounded-xl border border-black/10 bg-white dark:border-white/15 dark:bg-neutral-900">
          <img
            :src="img.src"
            :alt="img.alt"
            width="280"
            height="210"
            class="aspect-[4/3] w-full object-cover"
            loading="lazy"
          >
        </span>
        <p class="mt-2 text-xs text-muted truncate px-0.5">
          {{ img.caption || img.alt }}
        </p>
      </NuxtLink>
    </div>

    <p
      class="hidden md:block mt-5 min-h-5 text-center text-sm text-muted"
      aria-live="polite"
    >
      <Transition
        name="caption"
        mode="out-in"
      >
        <span :key="activeCaption" class="inline-block">
          {{ activeCaption }}
        </span>
      </Transition>
    </p>
  </div>
</template>

<style scoped>
.stage-frame {
  box-shadow:
    0 1px 1px rgb(0 0 0 / 0.04),
    0 8px 24px rgb(0 0 0 / 0.10),
    0 20px 40px rgb(0 0 0 / 0.06);
}

.stage-card {
  transform: rotate(var(--stage-rot, 0deg));
  transform-origin: center center;
}

.stage-card.is-dim {
  opacity: 0.7;
}

.stage-card.is-active,
.stage-card:hover,
.stage-card:focus-visible {
  animation: none !important;
  opacity: 1;
  transform: scale(1.06) rotate(var(--stage-rot, 0deg));
  z-index: 40;
}

.caption-enter-active,
.caption-leave-active {
  transition: opacity 220ms ease;
}
.caption-enter-from,
.caption-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .stage-card.is-active,
  .stage-card:hover,
  .stage-card:focus-visible {
    transform: rotate(var(--stage-rot, 0deg));
  }
  .caption-enter-active,
  .caption-leave-active {
    transition: none;
  }
}
</style>
