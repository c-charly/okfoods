<script setup lang="ts">
/**
 * Barre haute : visible a partir de 1024 px (desktop). En dessous (mobile et tablette), la barre basse prend le relais
 * et l'en-tete ne contient que le logo et le commutateur de langue.
 */
const { t } = useUi()
const { links } = useNavLinks()
const localePath = useLocalePath()
</script>

<template>
  <header class="on-dark relative z-50 bg-ok-blue text-ok-white lg:sticky lg:top-0">
    <div class="wrap flex h-14 items-center gap-4 xl:gap-6">
      <NuxtLink :to="localePath('/')" class="h-9 shrink-0 no-underline" :aria-label="t('a11y.home')"
        ><Logo variant="white"
      /></NuxtLink>
      <nav class="hidden flex-1 items-center gap-0.5 lg:flex xl:gap-1" :aria-label="t('a11y.mainNav')">
        <NuxtLink
          v-for="l in links"
          :key="l.key"
          :to="l.path"
          :aria-current="l.active ? 'page' : undefined"
          class="inline-flex min-h-11 items-center whitespace-nowrap rounded-full px-2.5 text-[0.95rem] font-semibold no-underline transition-colors hover:bg-ok-blue-soft xl:px-3.5 xl:text-base"
          :class="l.active ? 'text-ok-yellow' : 'text-ok-white'"
          >{{ l.label }}</NuxtLink
        >
      </nav>
      <div class="ml-auto flex shrink-0 items-center gap-2 lg:ml-0">
        <LangSwitch />
        <div class="hidden lg:block"><MotionToggle variant="icon" /></div>
      </div>
    </div>
  </header>
</template>
