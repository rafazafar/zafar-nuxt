<script setup lang="ts">
const navLinks = useNavLinks()
</script>

<template>
  <div class="scroll-pt-24">
    <UContainer class="sm:border-x border-default pt-20 md:pt-24">
      <AppHeader :links="navLinks" />
      <slot />
      <AppFooter />
    </UContainer>
  </div>
</template>
