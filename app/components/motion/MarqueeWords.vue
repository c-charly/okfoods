<script setup lang="ts">
import type { Produit } from '~/types/content'

/** Bandeau défilant de mots géants, entrecoupés de produits. Décoratif (aria-hidden). Mis en pause hors écran. */
const props = withDefaults(
  defineProps<{ words: string[]; products?: Produit[]; seconds?: number; reverse?: boolean; size?: string }>(),
  { products: () => [], seconds: 38, reverse: false, size: 'var(--step-hero)' },
)
const root = ref<HTMLElement>()
const paused = ref(true)
let io: IntersectionObserver | null = null
const items = computed<{ w?: string; p?: Produit }[]>(() =>
  props.words.flatMap((w, i) =>
    props.products.length ? [{ w }, { p: props.products[i % props.products.length] }] : [{ w }],
  ),
)

onMounted(() => {
  if (!root.value) return
  io = new IntersectionObserver(([e]) => (paused.value = !e?.isIntersecting), { rootMargin: '80px' })
  io.observe(root.value)
})
onBeforeUnmount(() => io?.disconnect())
</script>

<template>
  <div ref="root" class="marquee overflow-hidden" aria-hidden="true">
    <div
      class="marquee-track flex w-max items-center"
      :class="{ paused, reverse }"
      :style="{ '--dur': `${seconds}s`, fontSize: size }"
    >
      <ul v-for="n in 2" :key="n" class="flex shrink-0 items-center gap-[0.35em] pr-[0.35em]">
        <li v-for="(it, i) in items" :key="i" class="flex shrink-0 items-center">
          <span v-if="it.w" class="giant whitespace-nowrap">{{ it.w }}</span>
          <ProductArt v-else-if="it.p" :product="it.p" class="marquee-prod" size="1.05em" />
        </li>
      </ul>
    </div>
  </div>
</template>

<style>
.marquee-track {
  animation: ok-marquee var(--dur) linear infinite;
  will-change: transform;
}
.marquee-track.reverse {
  animation-direction: reverse;
}
.marquee-track.paused {
  animation-play-state: paused;
}
.marquee-prod {
  animation: ok-spin 18s linear infinite;
}
html[data-motion='lite'] .marquee-track {
  animation-duration: calc(var(--dur) * 1.6);
}
html[data-motion='lite'] .marquee-prod {
  animation: none;
}
</style>
