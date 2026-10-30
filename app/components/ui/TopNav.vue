<script setup lang="ts">
const { t } = useUi()
const { links } = useNavLinks()
const localePath = useLocalePath()
</script>

<template>
  <header class="on-dark relative z-50 bg-ok-blue text-ok-white md:sticky md:top-0">
    <div class="wrap flex h-14 items-center gap-5">
      <NuxtLink :to="localePath('/')" class="h-9 shrink-0 no-underline" :aria-label="t('a11y.home')"
        ><Logo variant="white"
      /></NuxtLink>
      <nav class="hidden flex-1 items-center gap-1 md:flex" :aria-label="t('a11y.mainNav')">
        <NuxtLink
          v-for="l in links"
          :key="l.key"
          :to="l.path"
          :aria-current="l.active ? 'page' : undefined"
          class="inline-flex min-h-11 items-center rounded-full px-3 text-[0.98rem] font-semibold no-underline transition-colors hover:bg-ok-blue-soft"
          :class="l.active ? 'text-ok-yellow' : 'text-ok-white'"
          >{{ l.label }}</NuxtLink
        >
      </nav>
      <div class="ml-auto flex items-center gap-2 md:ml-0">
        <LangSwitch />
        <div class="hidden md:block"><MotionToggle variant="icon" /></div>
        <div class="hidden md:block">
          <Btn to="/contact" variant="red" class="!min-h-11 !py-2">{{ t('nav.partner') }}</Btn>
        </div>
      </div>
    </div>
  </header>
</template>
