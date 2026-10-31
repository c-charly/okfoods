<script setup lang="ts">
import type { Recette } from '~/types/content'

/** " La Recette " : comment un produit arrive dans la main du consommateur, en étapes (3 à 8, pilotées par recette.json). */
const { locale } = useI18n()
const { t } = useUi()
const { data: recette } = await useAsyncData('recette', () => loadOne<Recette>('recette', locale.value), {
  watch: [locale],
})
useSeo('recipe')
</script>

<template>
  <div>
    <header class="relative overflow-hidden bg-ok-yellow px-4 pb-24 pt-14 text-ok-blue md:pb-32 md:pt-24">
      <div class="wrap grid items-center gap-8 md:grid-cols-[1.4fr_1fr]">
        <div>
          <p class="sub">{{ t('recette.kicker') }}</p>
          <h1 class="text-title mt-2 !text-[clamp(2.8rem,9vw,8rem)]">{{ t('recette.title') }}</h1>
          <p class="mt-4 max-w-[42ch] text-[1.2rem] font-bold">{{ t('recette.intro') }}</p>
          <p v-if="recette?.intro" class="mt-2 max-w-[42ch]">{{ recette.intro }}</p>
          <ul class="mt-6 flex flex-wrap gap-2" aria-label="Étapes">
            <li v-for="s in recette?.steps ?? []" :key="s.n">
              <a
                :href="`#step-${s.n}`"
                class="inline-flex min-h-11 items-center rounded-full border-2 border-current px-4 font-bold no-underline"
                >{{ s.n }}. {{ s.titre }}</a
              >
            </li>
          </ul>
        </div>
        <div class="mx-auto aspect-square w-[min(62vw,20rem)] md:w-full"><RecipeIcon name="bol" active /></div>
      </div>
      <div class="bite-bottom absolute inset-x-0 bottom-0 h-8 bg-ok-blue" aria-hidden="true" />
    </header>

    <RecipeStep v-for="(s, i) in recette?.steps ?? []" :key="s.n" :step="s" :index="i" />

    <section v-if="recette?.engagement" class="bg-ok-cream px-4 py-16 text-ok-blue">
      <div class="wrap">
        <h2 class="text-title">{{ recette.engagement.titre }}</h2>
        <p class="mt-3 max-w-[50ch] text-[1.2rem] font-bold">{{ recette.engagement.texte }}</p>
      </div>
    </section>

    <ReperesStrip :items="recette?.reperes ?? []" />
  </div>
</template>
