<script setup lang="ts">
const { locale, locales } = useI18n()
const switchPath = useSwitchLocalePath()
const { t } = useUi()
</script>

<template>
  <div class="flex items-center gap-1" role="group" :aria-label="t('lang.label')">
    <NuxtLink
      v-for="l in locales as { code: string }[]"
      :key="l.code"
      :to="switchPath(l.code as 'fr' | 'en')"
      :hreflang="l.code"
      :lang="l.code"
      :aria-current="l.code === locale ? 'true' : undefined"
      class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-3 text-base font-bold uppercase no-underline"
      :class="l.code === locale ? 'bg-ok-yellow text-ok-blue' : 'text-current'"
      >{{ l.code }}</NuxtLink
    >
  </div>
</template>
