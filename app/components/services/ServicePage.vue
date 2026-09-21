<script setup lang="ts">
import type { ServicePage } from '~/data/services'

defineProps<{
  service: ServicePage
}>()

const localePath = useLocalePath()
const { global } = useAppConfig()

const sectionUi = {
  container: 'py-12 sm:py-16',
  title: 'text-left text-xl sm:text-2xl lg:text-3xl font-medium',
  description: 'text-left mt-2 text-sm sm:text-md text-muted'
}

function formatIndex(index: number) {
  return String(index + 1).padStart(2, '0')
}
</script>

<template>
  <UPage>
    <UPageHero
      :title="service.title"
      :ui="{
        container: 'py-18 sm:py-24 lg:py-28',
        title: '!mx-0 text-left max-w-4xl',
        description: '!mx-0 text-left max-w-3xl',
        links: 'justify-start'
      }"
    >
      <template #description>
        <div class="max-w-3xl space-y-4 text-md sm:text-lg text-muted">
          <p>{{ service.hero.description }}</p>
          <p>
            {{ service.hero.supporting }}
            <template v-if="service.hero.related">
              <NuxtLink
                :to="localePath(service.hero.related.path)"
                class="font-medium text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary"
              >
                {{ service.hero.related.label }}
              </NuxtLink>{{ service.hero.supportingAfter }}
            </template>
          </p>
        </div>
      </template>

      <template #links>
        <div class="flex flex-wrap items-center gap-3">
          <UButton
            :to="global.meetingLink"
            label="Book a scoping call"
            color="primary"
            size="lg"
            target="_blank"
          />
          <UButton
            :to="`mailto:${global.email}`"
            label="hello@zafar.dev"
            color="neutral"
            variant="outline"
            size="lg"
          />
        </div>
      </template>
    </UPageHero>

    <UPageSection
      :title="service.audience.title"
      :ui="sectionUi"
    >
      <div class="grid gap-6 lg:grid-cols-2">
        <div class="rounded-xl border border-default bg-elevated/30 p-6 sm:p-8">
          <h3 class="text-lg font-semibold text-highlighted">
            {{ service.audience.fit.title }}
          </h3>
          <ul class="mt-5 space-y-4">
            <li
              v-for="item in service.audience.fit.items"
              :key="item"
              class="flex gap-3 text-sm leading-6 text-muted"
            >
              <UIcon
                name="i-lucide-check"
                class="mt-1 size-4 shrink-0 text-primary"
              />
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>

        <div class="rounded-xl border border-default p-6 sm:p-8">
          <h3 class="text-lg font-semibold text-highlighted">
            {{ service.audience.notFit.title }}
          </h3>
          <ul class="mt-5 space-y-4">
            <li
              v-for="item in service.audience.notFit.items"
              :key="item"
              class="flex gap-3 text-sm leading-6 text-muted"
            >
              <UIcon
                name="i-lucide-minus"
                class="mt-1 size-4 shrink-0 text-muted"
              />
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>
      </div>
    </UPageSection>

    <UPageSection
      :title="service.gap.title"
      :ui="sectionUi"
      class="border-t border-default"
    >
      <div class="max-w-3xl space-y-5 text-base leading-7 text-muted sm:text-lg">
        <p
          v-for="paragraph in service.gap.paragraphs"
          :key="paragraph"
        >
          {{ paragraph }}
        </p>
      </div>
    </UPageSection>

    <UPageSection
      :title="service.deliverables.title"
      :ui="sectionUi"
      class="border-t border-default"
    >
      <p
        v-if="service.deliverables.intro"
        class="mb-6 max-w-3xl text-base leading-7 text-muted"
      >
        {{ service.deliverables.intro }}
      </p>
      <ol class="grid gap-4 md:grid-cols-2">
        <li
          v-for="(item, index) in service.deliverables.items"
          :key="item.title"
          class="flex gap-4 rounded-xl border border-default p-5 sm:p-6"
        >
          <span class="pt-1 text-sm font-semibold tabular-nums text-primary">
            {{ formatIndex(index) }}
          </span>
          <div>
            <h3 class="font-semibold text-highlighted">
              {{ item.title }}
            </h3>
            <p class="mt-2 text-sm leading-6 text-muted">
              {{ item.description }}
            </p>
          </div>
        </li>
      </ol>
    </UPageSection>

    <UPageSection
      :title="service.process.title"
      :ui="sectionUi"
      class="border-t border-default"
    >
      <p
        v-if="service.process.intro"
        class="mb-6 max-w-3xl text-base leading-7 text-muted"
      >
        {{ service.process.intro }}
      </p>
      <ol class="relative space-y-7 border-l border-default pl-6 sm:pl-8">
        <li
          v-for="(item, index) in service.process.items"
          :key="item.title"
          class="relative"
        >
          <span class="absolute -left-[2.05rem] top-0 flex size-6 items-center justify-center rounded-full border border-default bg-default text-xs font-semibold tabular-nums text-primary sm:-left-[2.55rem]">
            {{ formatIndex(index) }}
          </span>
          <h3 class="font-semibold text-highlighted">
            {{ item.title }}
          </h3>
          <p class="mt-2 text-sm leading-6 text-muted">
            {{ item.description }}
          </p>
        </li>
      </ol>
      <p
        v-if="service.process.note"
        class="mt-8 max-w-3xl text-sm leading-6 text-muted"
      >
        {{ service.process.note }}
      </p>
    </UPageSection>

    <UPageSection
      v-if="service.controls"
      :title="service.controls.title"
      :ui="sectionUi"
      class="border-t border-default"
    >
      <div class="max-w-3xl space-y-5">
        <p class="text-base leading-7 text-muted">
          {{ service.controls.intro }}
        </p>
        <div class="overflow-x-auto rounded-xl border border-default">
          <table class="min-w-full divide-y divide-default text-left text-sm">
            <thead class="bg-elevated/30">
              <tr>
                <th class="px-4 py-3 font-semibold text-highlighted sm:px-6">
                  You might say
                </th>
                <th class="px-4 py-3 font-semibold text-highlighted sm:px-6">
                  What we design toward
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-default">
              <tr
                v-for="row in service.controls.rows"
                :key="row.label"
              >
                <th class="px-4 py-4 align-top font-medium text-highlighted sm:px-6">
                  {{ row.label }}
                </th>
                <td class="px-4 py-4 align-top leading-6 text-muted sm:px-6">
                  {{ row.design }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-sm leading-6 text-muted">
          {{ service.controls.note }}
        </p>
      </div>
    </UPageSection>

    <UPageSection
      v-if="service.pair"
      :title="service.pair.title"
      :ui="sectionUi"
      class="border-t border-default"
    >
      <div class="max-w-3xl space-y-5 text-base leading-7 text-muted">
        <p>{{ service.pair.intro }}</p>
        <p>
          {{ service.pair.prefix }}
          <NuxtLink
            :to="localePath(service.pair.related.path)"
            class="font-medium text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary"
          >
            {{ service.pair.related.label }}
          </NuxtLink>{{ service.pair.suffix }}
        </p>
        <UButton
          :to="localePath(service.pair.related.path)"
          :label="`Explore ${service.pair.related.label}`"
          color="neutral"
          variant="outline"
        />
      </div>
    </UPageSection>

    <UPageSection
      :title="service.proof.title"
      :ui="sectionUi"
      class="border-t border-default"
    >
      <div class="max-w-3xl rounded-xl border border-dashed border-default p-6 sm:p-8">
        <p class="text-sm leading-6 text-muted sm:text-base">
          {{ service.proof.body }}
        </p>
      </div>
    </UPageSection>

    <UPageSection
      title="Frequently asked questions"
      description="Answers to the questions that shape a safe, useful engagement."
      :ui="sectionUi"
      class="border-t border-default"
    >
      <UAccordion
        :items="service.faq"
        :unmount-on-hide="false"
        trailing-icon="lucide:plus"
        :ui="{
          item: 'border-none',
          trigger: 'mb-2 border-0 group px-4 transform-gpu rounded-lg bg-elevated/60 will-change-transform hover:bg-muted/50',
          trailingIcon: 'group-data-[state=closed]:rotate-0 group-data-[state=open]:rotate-135'
        }"
      >
        <template #body="{ item }">
          <p class="px-4 pb-3 text-sm leading-6 text-muted sm:text-base">
            {{ item.content }}
          </p>
        </template>
      </UAccordion>
    </UPageSection>

    <UPageSection
      :ui="{
        container: 'py-16 sm:py-20'
      }"
      class="border-t border-default"
    >
      <div class="rounded-2xl bg-elevated/50 p-6 sm:p-10">
        <h2 class="max-w-2xl text-2xl font-semibold tracking-tight text-highlighted sm:text-3xl">
          {{ service.closing.title }}
        </h2>
        <p class="mt-4 max-w-3xl text-base leading-7 text-muted sm:text-lg">
          {{ service.closing.description }}
        </p>
        <div class="mt-7 flex flex-wrap items-center gap-3">
          <UButton
            :to="global.meetingLink"
            label="Book a scoping call"
            color="primary"
            size="lg"
            target="_blank"
          />
          <UButton
            :to="`mailto:${global.email}`"
            label="hello@zafar.dev"
            color="neutral"
            variant="outline"
            size="lg"
          />
        </div>
        <p class="mt-7 max-w-3xl text-sm leading-6 text-muted">
          <span class="font-semibold text-highlighted">First call covers:</span>
          {{ service.closing.firstCall }}
        </p>
        <p
          v-if="service.closing.related"
          class="mt-4 text-sm leading-6 text-muted"
        >
          {{ service.closing.related.prefix }}
          <NuxtLink
            :to="localePath(service.closing.related.link.path)"
            class="font-medium text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary"
          >
            {{ service.closing.related.link.label }}
          </NuxtLink>{{ service.closing.related.suffix }}
        </p>
      </div>
    </UPageSection>
  </UPage>
</template>
