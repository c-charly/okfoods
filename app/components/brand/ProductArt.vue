<script setup lang="ts">
import type { Produit } from '~/types/content'

/** Produit : le PNG fourni s'il existe, sinon la silhouette de repli. Sans effet de morsure (voir BiteMask). */
const props = withDefaults(
  defineProps<{
    product: Pick<Produit, 'name' | 'image' | 'color' | 'accentColor' | 'kind'>
    size?: string
    decorative?: boolean
  }>(),
  { size: '100%', decorative: true },
)
const { resolve } = useImages()
const src = computed(() => resolve(props.product.image))
</script>

<template>
  <span class="inline-block shrink-0" :style="{ width: size, height: size }">
    <NuxtImg
      v-if="src"
      :src="src"
      :alt="decorative ? '' : product.name"
      width="480"
      height="480"
      format="webp"
      loading="lazy"
      class="h-full w-full object-contain"
    />
    <svg
      v-else
      viewBox="0 0 100 100"
      class="h-full w-full"
      :role="decorative ? undefined : 'img'"
      :aria-label="decorative ? undefined : product.name"
      :aria-hidden="decorative ? 'true' : undefined"
    >
      <ProductSilhouette
        :kind="product.kind"
        :name="product.name"
        :color="product.color"
        :accent="product.accentColor"
      />
    </svg>
  </span>
</template>
