<script setup lang="ts">
const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const availableLocales = computed(() => {
  return locales.value.filter(l => l.code !== locale.value)
})

const switchLanguage = (code: 'en' | 'ja' | 'de') => {
  return navigateTo(switchLocalePath(code))
}

const items = computed(() =>
  availableLocales.value.map(locale => ({
    label: locale.name,
    click: () => switchLanguage(locale.code as 'en' | 'ja' | 'de')
  }))
)
</script>

<template>
  <UDropdownMenu
    :items="items"
  >
    <UButton
      :icon="'i-lucide-globe'"
      size="xs"
      color="neutral"
      variant="ghost"
      :aria-label="$t('ui.selectLanguage')"
    />
  </UDropdownMenu>
</template>