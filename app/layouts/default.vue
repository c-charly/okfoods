<script setup lang="ts">
const { t } = useUi()
</script>

<template>
  <div class="flex min-h-svh flex-col">
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ok-yellow focus:px-5 focus:py-3 focus:font-bold focus:text-ok-blue"
      >{{ t('a11y.skip') }}</a
    >
    <TopNav />
    <main id="main" class="flex-1" tabindex="-1"><slot /></main>
    <SiteFooter />
    <BottomNav />
    <MoreMenu />
  </div>
</template>
