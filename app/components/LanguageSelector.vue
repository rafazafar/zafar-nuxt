<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()

const availableLocales = computed(() => {
  return locales.value.filter(l => l.code !== locale.value)
})

const switchLanguage = async (code: string) => {
  await setLocale(code)
}

const items = computed(() => [
  availableLocales.value.map(locale => ({
    label: locale.name,
    icon: 'i-lucide-globe',
    click: () => switchLanguage(locale.code)
  }))
])
</script>

<template>
  <UDropdown
    :items="items"
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
