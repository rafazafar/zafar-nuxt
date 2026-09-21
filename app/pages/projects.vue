<script setup lang="ts">
import type { Collections, ProjectsCollectionItem } from '@nuxt/content'

const { locale } = useI18n()
const { global } = useAppConfig()

const pageCollection = computed(() =>
  (locale.value === 'en' ? 'projects_page' : `projects_page_${locale.value}`) as keyof Collections
)
const listCollection = computed(() =>
  (locale.value === 'en' ? 'projects' : `projects_${locale.value}`) as keyof Collections
)

const { data: page } = await useAsyncData(
  () => `projects-hub-${locale.value}`,
  async () => queryCollection(pageCollection.value).first(),
  { watch: [locale] }
)

if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Projects page not found',
    fatal: true
  })
}

const { data: projects } = await useAsyncData(
  () => `projects-list-${locale.value}`,
  async () => {
    const all = await queryCollection(listCollection.value).all() as ProjectsCollectionItem[]
    return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  },
  { watch: [locale] }
)

const ctaProject = computed(() =>
  (projects.value ?? []).find(p => p.url === global.meetingLink) ?? null
)
const restProjects = computed(() =>
  (projects.value ?? []).filter(p => p.url !== global.meetingLink)
)

useSeoMeta({
  title: page.value?.seo?.title || page.value?.title || 'Projects',
  ogTitle: page.value?.seo?.title || page.value?.title || 'Projects',
  description: page.value?.seo?.description || page.value?.description,
  ogDescription: page.value?.seo?.description || page.value?.description
})
</script>

<template>
  <UPage v-if="page">
    <UPageHero
      :title="page.title"
      :description="page.description"
      :ui="{
        title: '!mx-0 text-left',
        description: '!mx-0 text-left',
        links: 'justify-start'
      }"
    >
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
            :label="global.email"
            color="neutral"
            variant="outline"
            size="lg"
          />
        </div>
      </template>
    </UPageHero>
    <UPageSection
      :ui="{
        container: '!pt-0'
      }"
    >
      <Motion
        v-if="ctaProject"
        :initial="{ opacity: 0, transform: 'translateY(10px)' }"
        :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
        :transition="{ delay: 0 }"
        :in-view-options="{ once: true }"
      >
        <UPageCard
          :title="ctaProject.title"
          :description="ctaProject.description"
          :to="ctaProject.url"
          orientation="horizontal"
          variant="outline"
          class="group ring-2 ring-primary/50 ring-offset-2 ring-offset-default mb-10 bg-primary/5"
          :ui="{
            wrapper: 'max-sm:order-last',
            title: 'text-primary'
          }"
        >
          <template #leading>
            <span class="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              <UIcon
                name="i-lucide-sparkles"
                class="size-4"
              />
              {{ ctaProject.alt }}
            </span>
          </template>
          <template #footer>
            <ULink
              v-if="ctaProject.url"
              :to="ctaProject.url"
              class="text-sm text-primary flex items-center font-medium"
            >
              {{ ctaProject.alt ?? 'View Project' }}
              <UIcon
                name="i-lucide-arrow-right"
                class="size-4 text-primary transition-all opacity-0 group-hover:translate-x-1 group-hover:opacity-100"
              />
            </ULink>
          </template>
          <img
            :src="ctaProject.image"
            :alt="ctaProject.title"
            class="object-cover w-full h-48 rounded-lg"
          >
        </UPageCard>
      </Motion>
      <Motion
        v-for="(project, index) in restProjects"
        :key="project.path || project.title"
        :initial="{ opacity: 0, transform: 'translateY(10px)' }"
        :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
        :transition="{ delay: 0.1 * index }"
        :in-view-options="{ once: true }"
      >
        <UPageCard
          :title="project.title"
          :description="project.description"
          :to="project.url"
          orientation="horizontal"
          variant="naked"
          :reverse="index % 2 === 1"
          class="group"
          :ui="{
            wrapper: 'max-sm:order-last'
          }"
        >
          <template #leading>
            <span class="text-sm text-muted">
              {{ new Date(project.date).getFullYear() }}
            </span>
          </template>
          <template #footer>
            <ULink
              v-if="project.url"
              :to="project.url"
              class="text-sm text-primary flex items-center"
            >
              {{ project.alt ?? 'View Project' }}
              <UIcon
                name="i-lucide-arrow-right"
                class="size-4 text-primary transition-all opacity-0 group-hover:translate-x-1 group-hover:opacity-100"
              />
            </ULink>
            <p
              v-else-if="project.alt"
              class="text-sm text-muted"
            >
              {{ project.alt }}
            </p>
          </template>
          <img
            :src="project.image"
            :alt="project.title"
            class="object-cover w-full h-48 rounded-lg"
          >
        </UPageCard>
      </Motion>
    </UPageSection>
    <LandingCtaBand
      title="This could be next."
      description="Let's map the problem and the first honest slice."
    />
  </UPage>
</template>
