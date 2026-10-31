<script setup lang="ts">
import { ENVIES } from '~~/config/envies'
import type { Produit } from '~/types/content'

/** " Le Défilé " : aucune grille, aucune carte. Un produit par écran, couleur qui balaie, index collant, filtre d'envie. */
const { locale } = useI18n()
const { t } = useUi()
const { envie, setEnvie } = useEnvie()
const { data: produits } = await useAsyncData(
  'produits',
  () => loadList<Produit>('produits', locale.value, 'slug', 'order'),
  { watch: [locale], default: () => [] },
)
useSeo('products')

// Les produits correspondants passent en premier ; les autres restent accessibles à la suite.
const matches = (p: Produit) => !!envie.value && p.envies.includes(envie.value)
const list = computed(() => {
  if (!envie.value) return produits.value
  return [...produits.value.filter(matches), ...produits.value.filter((p) => !matches(p))]
})
const prev = (i: number) => (i === 0 ? 'var(--ok-cream)' : list.value[i - 1]!.color)

const active = ref('')
let io: IntersectionObserver | null = null
function observe() {
  io?.disconnect()
  io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) if (e.isIntersecting) active.value = (e.target as HTMLElement).dataset.slug ?? ''
    },
    { rootMargin: '-45% 0px -50% 0px' },
  )
  document.querySelectorAll('[data-slug]').forEach((el) => io!.observe(el))
}
onMounted(() => {
  observe()
})
onBeforeUnmount(() => io?.disconnect())
watch(list, async () => {
  await nextTick()
  observe()
  if (import.meta.client) loadGsap().then(({ ScrollTrigger }) => window.setTimeout(() => ScrollTrigger.refresh(), 60))
})
</script>

<template>
  <div>
    <header class="relative overflow-hidden bg-ok-cream px-4 pb-6 pt-12 text-ok-blue md:pt-20">
      <div class="wrap">
        <p class="sub">{{ t('produits.kicker') }}</p>
        <h1 class="giant mt-1 text-[clamp(3rem,13vw,11rem)]">{{ t('produits.title') }}</h1>
        <p class="mt-4 max-w-[40ch] text-[1.2rem] font-bold">{{ t('produits.intro') }}</p>
        <!-- <div class="mt-6 flex flex-wrap items-center gap-2" role="group" :aria-label="t('produits.filter')">
          <span class="mr-1 font-bold">{{ t('produits.filter') }} :</span>
          <Pill :active="!envie" @click="setEnvie(null)">{{ t('produits.all') }}</Pill>
          <Pill v-for="e in ENVIES" :key="e" :active="envie === e" @click="setEnvie(envie === e ? null : e)">{{
            t(`envies.${e}`)
          }}</Pill>
        </div> -->
      </div>
      <!-- <div class="mt-8 flex h-12 overflow-hidden md:h-16" aria-hidden="true">
        <span v-for="p in list" :key="p.slug" class="bite-top block flex-1" :style="{ background: p.color }" />
      </div> -->
    </header>

    <nav
      class="sticky top-0 z-40 border-y-2 border-ok-blue bg-ok-cream text-ok-blue lg:top-14"
      :aria-label="t('produits.jump')"
    >
      <ul
        class="flex gap-2 overflow-x-auto px-4 py-2 md:px-[max(1rem,calc((100%-80rem)/2))]"
        style="overscroll-behavior-x: contain"
      >
        <li v-for="p in list" :key="p.slug" class="shrink-0">
          <Pill as="a" :href="`#${p.slug}`" :active="active === p.slug">{{ p.name }}</Pill>
        </li>
      </ul>
    </nav>

    <ProductScreen
      v-for="(p, i) in list"
      :key="p.slug"
      :product="p"
      :index="i"
      :prev-color="prev(i)"
      :highlighted="matches(p)"
    />

    <section
      class="on-dark text-center text-ok-white"
      :style="{ background: list.length ? list[list.length - 1]!.color : 'var(--ok-blue)' }"
    >
      <div class="bite-top bg-ok-blue-deep px-4 pb-16 pt-24">
        <p class="font-display text-[clamp(2rem,6vw,4.5rem)] leading-none">{{ t('produits.end') }}</p>
        <div class="mt-6">
          <Btn to="/contact" variant="yellow">{{ t('cta.distributor') }}</Btn>
        </div>
      </div>
    </section>
  </div>
</template>
