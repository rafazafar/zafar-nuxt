<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()

const availableLocales = computed(() => {
  return locales.value.filter(l => l.code !== locale.value)
})
</script>

<template>
  <UDropdown
    :items="[availableLocales.map(locale => ({
      label: locale.name,
      icon: 'i-lucide-globe',
      click: () => setLocale(locale.code)
    }))]"
  >
    <UButton
      :icon="'i-lucide-globe'"
      size="xs"
      color="neutral"
      variant="ghost"
      :aria-label="$t('ui.selectLanguage')"
    />
  </UDropdown>
</template>
