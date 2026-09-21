<script setup lang="ts">
import ServicePage from '~/components/services/ServicePage.vue'
import { services } from '~/data/services'

const service = services.aiSystems

useHead({
  titleTemplate: '%s'
})

useSeoMeta({
  title: service.seo.title,
  ogTitle: service.seo.title,
  description: service.seo.description,
  ogDescription: service.seo.description
})
</script>

<template>
  <ServicePage :service="service" />
</template>
