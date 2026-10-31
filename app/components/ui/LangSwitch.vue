<script setup lang="ts">
/**
 * Commutateur de langue : UN seul controle (lien) qui bascule vers l'autre langue.
 * Le pouce jaune glisse sur la langue active. Fonctionne avec n'importe quel nombre de langues (passe a la suivante).
 */
const { locale, locales } = useI18n()
const switchPath = useSwitchLocalePath()
const { t } = useUi()

const codes = computed(() => (locales.value as { code: string }[]).map((l) => l.code))
const index = computed(() => Math.max(0, codes.value.indexOf(locale.value)))
const next = computed(() => codes.value[(index.value + 1) % codes.value.length]!)
const label = computed(() => `${t('lang.switch')} : ${t(`lang.${next.value}`)}`)
</script>

<template>
  <NuxtLink
    :to="switchPath(next as 'fr' | 'en')"
    :hreflang="next"
    :lang="next"
    :aria-label="label"
    :title="label"
    class="lang-switch relative inline-flex h-11 w-[5.5rem] shrink-0 items-center rounded-full border-2 border-current p-0.5 text-base font-bold uppercase no-underline"
  >
    <span
      class="lang-thumb absolute bottom-0.5 left-0.5 top-0.5 w-[calc(50%-0.125rem)] rounded-full bg-ok-yellow"
      :style="{ transform: `translateX(${index * 100}%)` }"
      aria-hidden="true"
    />
    <span
      v-for="(c, i) in codes"
      :key="c"
      class="relative z-10 grid h-full flex-1 place-items-center transition-colors duration-300"
      :class="i === index ? 'text-ok-blue' : 'text-current'"
      aria-hidden="true"
      >{{ c }}</span
    >
  </NuxtLink>
</template>

<style>
.lang-thumb {
  transition: transform 0.32s var(--ease-spring);
}
</style>
