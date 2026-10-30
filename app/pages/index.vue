<script setup lang="ts">
import type { Dict, Produit } from '~/types/content'

const { locale } = useI18n()
const { raw } = useUi()
const { data: produits } = await useAsyncData(
  'home-produits',
  () => loadList<Produit>('produits', locale.value, 'slug', 'order'),
  { watch: [locale], default: () => [] },
)
const { data: recette } = await useAsyncData('home-recette', () => loadOne<Dict>('recette', locale.value), {
  watch: [locale],
})
useSeo('home')
</script>

<template>
  <div>
    <HomeOpening :products="produits" />
    <HomeEnvie :products="produits" />
    <HomeMoment :products="produits" />
    <section class="overflow-hidden bg-ok-cream py-10 text-ok-blue" aria-hidden="true">
      <MarqueeWords :words="raw('home.marquee') ?? []" :products="produits" :seconds="42" />
    </section>
    <HomeRecipePreview :steps="recette?.steps?.slice(0, 3) ?? []" />
    <HomeTeamBand />
  </div>
</template>
