<script setup lang="ts">
import type { Croqueur, Produit } from '~/types/content'

/**
 * " Face à face " : 3 à 5 scènes plein écran, une personne + son produit + sa phrase en géant.
 * Desktop : les scènes s'empilent (collant natif) ; mobile : défilement vertical avec accroche douce (proximity), jamais bloquant.
 */
const props = defineProps<{ scenes: Croqueur[]; products: Produit[] }>()
const { t } = useUi()
const { mode } = useMotion()
const root = ref<HTMLElement>()
let ctx: { revert: () => void } | null = null
let io: IntersectionObserver | null = null

const productOf = (c: Croqueur) => props.products.find((p) => p.slug === c.produit)
const bgOf = (c: Croqueur) => productOf(c)?.color ?? 'var(--ok-blue)'
const fgOf = (c: Croqueur) => {
  const p = productOf(c)
  return p ? textOn(p.color) : 'var(--ok-white)'
}

onMounted(async () => {
  if (!root.value) return
  // Accroche douce du défilement uniquement pendant que la section est visible
  if (mode.value !== 'static') {
    io = new IntersectionObserver(
      ([e]) => document.documentElement.classList.toggle('snap-soft', !!e?.isIntersecting),
      { threshold: 0.15 },
    )
    io.observe(root.value)
  }
  if (mode.value !== 'full') return
  const { gsap } = await loadGsap()
  if (mode.value !== 'full') return
  ctx = gsap.context(() => {
    gsap.utils.toArray<HTMLElement>('[data-front]', root.value!).forEach((el) => {
      gsap.fromTo(
        el,
        { yPercent: 35, rotate: -10 },
        {
          yPercent: -12,
          rotate: 8,
          ease: 'none',
          scrollTrigger: { trigger: el.closest('[data-scene]'), start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )
    })
  }, root.value)
})
onBeforeUnmount(() => {
  io?.disconnect()
  document.documentElement.classList.remove('snap-soft')
  ctx?.revert()
})
</script>

<template>
  <section ref="root" class="faceaface relative" aria-labelledby="face-title">
    <h2 id="face-title" class="sr-only">{{ t('parole.c.title') }}</h2>
    <article
      v-for="(c, i) in scenes"
      :key="c.id"
      data-scene
      class="face-scene relative flex min-h-svh items-end overflow-hidden px-4 pb-28 pt-20 md:items-center lg:pb-16"
      :class="i > 0 ? 'bite-top' : ''"
      :style="{ background: bgOf(c), color: fgOf(c) }"
    >
      <div class="absolute inset-y-0 left-0 w-full md:w-1/2" aria-hidden="true">
        <SmartImage
          :src="c.image"
          :alt="''"
          :width="800"
          :height="1000"
          :force-placeholder="!c.consentement"
          variant="person"
          :tint="bgOf(c)"
          :initials="initials(c.prenom)"
          class="!aspect-auto h-full w-full opacity-90 md:opacity-100"
        />
      </div>
      <div class="wrap relative grid w-full md:grid-cols-2">
        <div class="md:col-start-2 pl-2">
          <p
            class="font-display text-[clamp(1.4rem,6vw,4.2rem)] leading-[0.95] [text-shadow:0_2px_0_color-mix(in_srgb,var(--ok-ink)_25%,transparent)]"
          >
            <UiIcon name="quote" size="mr-[0.15em] inline-block h-[0.65em] w-[0.65em]" />{{ c.phrase
            }}<UiIcon name="quote" size="ml-[0.15em] inline-block h-[0.65em] w-[0.65em] rotate-180" />
          </p>
          <p class="mt-4 text-xl font-bold">
            {{ c.prenom }}, {{ c.ville }} 
            <!-- <span class="sub font-normal">{{ t('parole.c.says') }}</span> -->
            <PlaceholderBadge :show="c.placeholder" />
          </p>
          <!-- <p class="text-lg font-bold">
            {{ productOf(c)?.name }}
            <Sep />{{ t(`moments.${c.moment}`) }}
          </p> -->
        </div>
      </div>
      <!-- <div
        v-if="productOf(c)"
        data-front
        class="pointer-events-none absolute bottom-[8%] right-[4%] w-[34vw] max-w-[22rem] md:right-[10%] md:w-[24vw]"
        aria-hidden="true"
      >
        <ProductArt :product="productOf(c)!" />
      </div> -->
    </article>
  </section>
</template>

<style>
.face-scene {
  scroll-snap-align: start;
}
@media (min-width: 768px) and (hover: hover) and (pointer: fine) {
  html:not([data-motion='static']) .face-scene {
    position: sticky;
    top: 0;
    height: 100svh;
  }
}
</style>
