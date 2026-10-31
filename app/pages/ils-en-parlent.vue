<script setup lang="ts">
import type { Avis, Croqueur, Produit } from '~/types/content'

/** " Ils en parlent " : 3 ouvertures, 3 mécaniques - A) tableau de gare, B) mosaïque de croqueurs, C) face à face. */
const { locale } = useI18n()
const { data: avis } = await useAsyncData('avis', () => loadBody<Avis>('avis', locale.value), {
  watch: [locale],
  default: () => [],
})
const { data: croqueurs } = await useAsyncData('croqueurs', () => loadBody<Croqueur>('croqueurs', locale.value), {
  watch: [locale],
  default: () => [],
})
const { data: produits } = await useAsyncData(
  'parole-produits',
  () => loadList<Produit>('produits', locale.value, 'slug', 'order'),
  { watch: [locale], default: () => [] },
)
const scenes = computed(() => croqueurs.value.filter((c) => c.enAvant).slice(0, 5))
useSeo('words')
</script>

<template>
  <div>
    <ReplyTicker :avis="avis" />
    <CroqueursWall :items="croqueurs" :products="produits" />
    <FaceAFace v-if="scenes.length" :scenes="scenes" :products="produits" />
  </div>
</template>
