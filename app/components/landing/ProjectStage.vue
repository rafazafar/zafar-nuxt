<script lang="ts">
/** Survives component remounts during the same page load. */
let stageEntryScheduled = false
</script>

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
const mobileActive = ref(0)
const settlingIndex = ref<number | null>(null)
const reduceMotion = ref(false)
/** pending = CSS-hidden first paint; animating = stagger in; rest = settled.
 *  Init from module flag so SPA remounts don’t flash pending. */
const entryState = ref<'pending' | 'animating' | 'rest'>(stageEntryScheduled ? 'rest' : 'pending')
const mobileTrack = ref<HTMLElement | null>(null)

let mobileObserver: IntersectionObserver | undefined
let settleTimer: number | undefined
let scrollTimer: number | undefined
let entryCleanupTimer: number | undefined

const stageImages = computed(() => (props.images || []).slice(0, 5))

const rotations = [-8, -4, 0, 4, 8]
const driftClass = ['stage-drift-a', 'stage-drift-b', 'stage-drift-c', 'stage-drift-a', 'stage-drift-b']
const driftPhases = [0, -2.2, -4.8, -1.8, -5.6]
const stageEntryKey = 'zafar-stage-entered'

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
  mobileActive.value = index
}

function onBlur(event: FocusEvent) {
  const root = (event.currentTarget as HTMLElement).closest('[data-stage-root]')
  const next = event.relatedTarget as HTMLElement | null
  if (!next || !root?.contains(next)) {
    setActive(null)
  }
}

function resetMagnetic(element: HTMLElement) {
  element.style.setProperty('--magnetic-x', '0px')
  element.style.setProperty('--magnetic-y', '0px')
}

function onPointerMove(event: MouseEvent) {
  const element = event.currentTarget as HTMLElement
  if (reduceMotion.value) {
    resetMagnetic(element)
    return
  }

  const bounds = element.getBoundingClientRect()
  const x = Math.max(-8, Math.min(8, (event.clientX - (bounds.left + bounds.width / 2)) * 0.08))
  const y = Math.max(-8, Math.min(8, (event.clientY - (bounds.top + bounds.height / 2)) * 0.08))
  element.style.setProperty('--magnetic-x', `${x}px`)
  element.style.setProperty('--magnetic-y', `${y}px`)
}

function onPointerLeave(event: MouseEvent) {
  const element = event.currentTarget as HTMLElement
  resetMagnetic(element)
  if (document.activeElement !== element) {
    const root = element.closest('[data-stage-root]')
    if (!root?.querySelector(':focus-visible')) {
      setActive(null)
    }
  }
}

function onDesktopLeave(event: MouseEvent) {
  const root = event.currentTarget as HTMLElement
  if (!root.querySelector(':focus-visible')) {
    setActive(null)
  }
}

function pulseMobileCard(index: number) {
  if (reduceMotion.value) {
    return
  }

  settlingIndex.value = index
  if (settleTimer) {
    window.clearTimeout(settleTimer)
  }
  settleTimer = window.setTimeout(() => {
    if (settlingIndex.value === index) {
      settlingIndex.value = null
    }
  }, 100)
}

function setMobileActive(index: number) {
  if (mobileActive.value === index) {
    return
  }
  mobileActive.value = index
  pulseMobileCard(index)
}

function syncMobileActive() {
  const track = mobileTrack.value
  if (!track) {
    return
  }

  const trackBounds = track.getBoundingClientRect()
  const trackCenter = trackBounds.left + trackBounds.width / 2
  let closestIndex: number | null = null
  let closestDistance = Number.POSITIVE_INFINITY

  track.querySelectorAll<HTMLElement>('[data-stage-index]').forEach((element) => {
    const bounds = element.getBoundingClientRect()
    const visibleWidth = Math.min(bounds.right, trackBounds.right) - Math.max(bounds.left, trackBounds.left)
    if (visibleWidth <= 0) {
      return
    }

    const distance = Math.abs((bounds.left + bounds.width / 2) - trackCenter)
    if (distance < closestDistance) {
      closestDistance = distance
      closestIndex = Number(element.dataset.stageIndex)
    }
  })

  if (closestIndex !== null) {
    setMobileActive(closestIndex)
  }
}

function onMobileScroll() {
  if (scrollTimer) {
    window.clearTimeout(scrollTimer)
  }
  scrollTimer = window.setTimeout(syncMobileActive, 120)
}

function entryClassFor(_index: number) {
  if (entryState.value === 'pending') {
    return 'stage-entry-pending'
  }
  if (entryState.value === 'animating') {
    return 'stage-entry-animating'
  }
  return ''
}

function finishEntryAnimation() {
  if (entryState.value === 'animating') {
    entryState.value = 'rest'
  }
  if (entryCleanupTimer) {
    window.clearTimeout(entryCleanupTimer)
    entryCleanupTimer = undefined
  }
}

function scheduleEntryCleanup() {
  const count = stageImages.value.length
  const staggerMs = Math.max(0, count - 1) * 70
  if (entryCleanupTimer) {
    window.clearTimeout(entryCleanupTimer)
  }
  entryCleanupTimer = window.setTimeout(finishEntryAnimation, staggerMs + 560 + 80)
}

function onEntryAnimationEnd(event: AnimationEvent) {
  if (entryState.value !== 'animating') {
    return
  }
  if (!String(event.animationName).includes('stage-enter')) {
    return
  }
  // Delay var lives on the card; content inherits it for computed style.
  const target = event.target as HTMLElement | null
  if (!target) {
    return
  }
  const delayRaw = getComputedStyle(target).getPropertyValue('--stage-entry-delay').trim()
  const delayMs = Number.parseFloat(delayRaw) || 0
  const lastDelay = Math.max(0, stageImages.value.length - 1) * 70
  if (delayMs >= lastDelay) {
    finishEntryAnimation()
  }
}

onMounted(() => {
  reduceMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // CSS default = pending (opacity 0 / translateY 28px). After mount, either
  // settle immediately or double-rAF into the stagger animation.
  // sessionStorage stores performance.timeOrigin so SPA remounts skip, but a
  // hard reload (new timeOrigin) re-runs once for this document load.
  if (reduceMotion.value) {
    entryState.value = 'rest'
  } else {
    const loadId = String(performance.timeOrigin)
    let alreadyThisLoad = stageEntryScheduled
    try {
      alreadyThisLoad = alreadyThisLoad || window.sessionStorage.getItem(stageEntryKey) === loadId
    } catch {
      // ignore
    }

    if (alreadyThisLoad) {
      entryState.value = 'rest'
    } else {
      stageEntryScheduled = true
      try {
        window.sessionStorage.setItem(stageEntryKey, loadId)
      } catch {
        // ignore quota / private mode
      }
      nextTick(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // pending → animating (do not only remove pending — that snaps)
            entryState.value = 'animating'
            scheduleEntryCleanup()
          })
        })
      })
    }
  }

  const track = mobileTrack.value
  if (track) {
    mobileObserver = new IntersectionObserver((entries) => {
      if (entries.length) {
        syncMobileActive()
      }
    }, {
      root: track,
      threshold: [0, 0.5, 0.75, 1]
    })

    track.querySelectorAll<HTMLElement>('[data-stage-index]').forEach((element) => {
      mobileObserver?.observe(element)
    })
    syncMobileActive()
  }
})

onBeforeUnmount(() => {
  mobileObserver?.disconnect()
  if (settleTimer) {
    window.clearTimeout(settleTimer)
  }
  if (scrollTimer) {
    window.clearTimeout(scrollTimer)
  }
  if (entryCleanupTimer) {
    window.clearTimeout(entryCleanupTimer)
  }
})
</script>

<template>
  <div
    data-stage-root
    class="stage-root relative z-0 mt-0 w-full min-w-0 max-w-full overflow-hidden"
  >
    <!-- Desktop / md+: layered fan -->
    <div
      class="stage-desktop relative z-0 mx-auto hidden h-[19rem] w-full max-w-[68rem] overflow-hidden p-8 md:block lg:h-[21rem]"
      @mouseleave="onDesktopLeave"
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
        <div
          class="stage-card-layer"
          :class="[
            !reduceMotion ? driftClass[index % driftClass.length] : '',
            active !== null && active !== index ? 'is-dim' : '',
            active === index ? 'is-active' : ''
          ]"
          :style="{
            '--stage-rot': `${rotations[index % rotations.length]}deg`,
            '--stage-phase': `${driftPhases[index % driftPhases.length]}s`
          }"
        >
          <NuxtLink
            :to="img.link ? localePath(img.link) : localePath('/projects')"
            class="stage-card group relative block w-[11.5rem] rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-(--ui-bg) lg:w-[13rem]"
            :class="[
              entryClassFor(index),
              index === Math.floor((stageImages.length - 1) / 2) ? 'is-center' : ''
            ]"
            :style="{ '--stage-entry-delay': `${index * 70}ms` }"
            :aria-label="img.caption || img.alt"
            @mouseenter="setActive(index)"
            @mousemove="onPointerMove"
            @mouseleave="onPointerLeave"
            @focus="onFocus(index)"
            @blur="onBlur"
          >
            <span
              class="stage-entry-content block"
              @animationend="onEntryAnimationEnd"
            >
              <span class="stage-frame block overflow-hidden rounded-xl bg-white dark:bg-neutral-900">
                <img
                  :src="img.src"
                  :alt="img.alt"
                  width="240"
                  height="180"
                  class="aspect-[4/3] w-full object-cover"
                  loading="lazy"
                >
              </span>
            </span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Mobile: snap carousel with peek -->
    <div class="stage-mobile-viewport w-full min-w-0 max-w-full overflow-x-hidden md:hidden">
      <div
        ref="mobileTrack"
        class="stage-mobile-track flex w-full min-w-0 max-w-full snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        @scroll.passive="onMobileScroll"
      >
        <NuxtLink
          v-for="(img, index) in stageImages"
          :key="'m-' + img.src + index"
          :data-stage-index="index"
          :to="img.link ? localePath(img.link) : localePath('/projects')"
          class="stage-mobile-card w-[min(72vw,16rem)] shrink-0 snap-center rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          :class="[
            entryClassFor(index),
            mobileActive === index ? 'is-mobile-active' : '',
            settlingIndex === index ? 'is-settling' : ''
          ]"
          :style="{ '--stage-entry-delay': `${index * 70}ms` }"
          :aria-label="img.caption || img.alt"
          @focus="onFocus(index)"
          @blur="onBlur"
        >
          <span
            class="stage-entry-content block"
            @animationend="onEntryAnimationEnd"
          >
            <span class="stage-frame block overflow-hidden rounded-xl bg-white dark:bg-neutral-900">
              <img
                :src="img.src"
                :alt="img.alt"
                width="280"
                height="210"
                class="aspect-[4/3] w-full object-cover"
                loading="lazy"
              >
            </span>
            <p class="stage-caption mt-2 truncate px-0.5 text-xs">
              {{ img.caption || img.alt }}
            </p>
          </span>
        </NuxtLink>
      </div>
    </div>

    <div
      v-if="stageImages.length > 1"
      class="stage-dots mt-3 flex justify-center gap-1.5 md:hidden"
      aria-hidden="true"
    >
      <span
        v-for="(_, index) in stageImages"
        :key="`dash-${index}`"
        class="stage-dot"
        :class="{ 'is-active': mobileActive === index }"
      />
    </div>

    <p
      class="stage-caption mt-5 hidden min-h-5 text-center text-sm md:block"
      aria-live="polite"
    >
      <Transition
        name="caption"
        mode="out-in"
      >
        <span
          :key="activeCaption"
          class="inline-block"
        >
          {{ activeCaption }}
        </span>
      </Transition>
    </p>
  </div>
</template>

<style scoped>
.stage-root {
  isolation: isolate;
  contain: paint;
}

.stage-card-layer {
  transform: rotate(var(--stage-rot, 0deg));
  transform-origin: center center;
  will-change: transform;
}

.stage-card-layer.is-dim {
  opacity: 0.76;
}

.stage-card-layer.is-active,
.stage-card-layer:has(.stage-card:hover),
.stage-card-layer:has(.stage-card:focus-visible) {
  animation: none !important;
  transform: rotate(var(--stage-rot, 0deg));
  opacity: 1;
}

.stage-card,
.stage-mobile-card {
  --magnetic-x: 0px;
  --magnetic-y: 0px;
  --stage-entry-opacity: 1;
  transform: translate3d(var(--magnetic-x), var(--magnetic-y), 0) scale(var(--stage-scale, 1));
  transform-origin: center center;
  transition: transform 180ms cubic-bezier(0.2, 0.75, 0.2, 1), opacity 180ms ease, filter 180ms ease;
  will-change: transform;
}

.stage-card.is-center {
  --stage-scale: 1.02;
}

.stage-card.is-active,
.stage-card:hover,
.stage-card:focus-visible {
  --stage-scale: 1.06;
  opacity: 1;
}

.stage-frame {
  position: relative;
  border: 1px solid rgb(0 0 0 / 0.06);
  /* A tight contact shadow plus a wider ambient desk shadow. */
  box-shadow:
    0 2px 3px -1px rgb(0 0 0 / 0.18),
    0 12px 22px -8px rgb(0 0 0 / 0.08);
}

.stage-frame::before {
  position: absolute;
  z-index: 1;
  inset: 0 0 auto;
  height: 1px;
  pointer-events: none;
  content: '';
  background: linear-gradient(90deg, rgb(255 255 255 / 0), rgb(255 255 255 / 0.9) 50%, rgb(255 255 255 / 0));
}

.dark .stage-frame {
  border-color: rgb(255 255 255 / 0.14);
  box-shadow:
    0 2px 3px -1px rgb(0 0 0 / 0.3),
    0 12px 22px -8px rgb(0 0 0 / 0.18);
}

.stage-card.is-active .stage-frame,
.stage-card:hover .stage-frame,
.stage-card:focus-visible .stage-frame,
.stage-mobile-card.is-mobile-active .stage-frame {
  box-shadow:
    0 3px 4px -1px rgb(0 0 0 / 0.22),
    0 15px 28px -8px rgb(0 0 0 / 0.14);
}

.dark .stage-card.is-active .stage-frame,
.dark .stage-card:hover .stage-frame,
.dark .stage-card:focus-visible .stage-frame,
.dark .stage-mobile-card.is-mobile-active .stage-frame {
  box-shadow:
    0 3px 4px -1px rgb(0 0 0 / 0.4),
    0 15px 28px -8px rgb(0 0 0 / 0.26);
}

/* Pending / animating also in main.css (global first paint + stage-enter keyframes) */
.stage-entry-pending {
  opacity: 0;
  pointer-events: none;
}

.stage-entry-pending .stage-entry-content {
  opacity: 0;
  transform: translateY(28px);
}

.stage-entry-animating {
  opacity: 1;
  pointer-events: none;
  /* Avoid card opacity transition fighting content stage-enter */
  transition: none;
}

.stage-entry-animating .stage-entry-content {
  animation: stage-enter 560ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--stage-entry-delay, 0ms);
}

.stage-mobile-track {
  padding-inline: max(1rem, calc((100% - min(72vw, 16rem)) / 2));
  scroll-padding-inline: max(1rem, calc((100% - min(72vw, 16rem)) / 2));
}

.stage-mobile-card {
  --stage-scale: 1;
  --stage-entry-opacity: 0.88;
  opacity: 0.88;
}

.stage-mobile-card.is-mobile-active {
  --stage-scale: 1.04;
  --stage-entry-opacity: 1;
  opacity: 1;
}

.stage-mobile-card.is-settling {
  animation: stage-settle 100ms ease-out;
}

@keyframes stage-settle {
  0% { transform: scale(1.04); }
  45% { transform: scale(1.075); }
  100% { transform: scale(1.04); }
}

.stage-caption {
  color: #52525b;
}

.dark .stage-caption {
  color: rgb(212 212 216);
}

.stage-dot {
  width: 0.75rem;
  height: 2px;
  background: rgb(82 82 91 / 0.35);
  transition: width 180ms ease, background-color 180ms ease;
}

.stage-dot.is-active {
  width: 1.5rem;
  background: rgb(82 82 91 / 0.85);
}

.caption-enter-active,
.caption-leave-active {
  transition: opacity 180ms ease;
}

.caption-enter-from,
.caption-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .stage-card-layer,
  .stage-card-layer.is-active,
  .stage-card-layer:has(.stage-card:hover),
  .stage-card-layer:has(.stage-card:focus-visible) {
    animation: none !important;
  }

  .stage-card,
  .stage-mobile-card,
  .stage-dot {
    transition: none;
  }

  .stage-entry-pending,
  .stage-entry-animating {
    opacity: 1;
    pointer-events: auto;
  }

  .stage-entry-pending .stage-entry-content,
  .stage-entry-animating .stage-entry-content {
    animation: none !important;
    opacity: 1;
    transform: none;
  }

  .stage-mobile-card.stage-entry-pending,
  .stage-mobile-card.stage-entry-animating {
    opacity: 0.88;
  }

  .stage-mobile-card.is-mobile-active.stage-entry-pending,
  .stage-mobile-card.is-mobile-active.stage-entry-animating {
    opacity: 1;
  }

  .stage-mobile-card.is-settling {
    animation: none;
  }

  .caption-enter-active,
  .caption-leave-active {
    transition: none;
  }
}
</style>
