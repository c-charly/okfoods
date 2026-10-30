<script setup lang="ts">
import type { Produit } from '~/types/content'

/**
 * Un produit = un écran entier : couleur propre, nom géant derrière, PNG au premier plan, ombre au sol,
 * miettes d'ambiance. La fiche est TOUJOURS en texte (jamais derrière un tap ou un survol).
 */
const props = defineProps<{ product: Produit; prevColor: string; index: number; highlighted?: boolean }>()
const { t } = useUi()

const art = ref<{ bite: () => void; reset: () => void; level: number; done: boolean } | null>(null)
const crumbs = ref<{ burst: (x: number, y: number, c: string, n?: number) => void } | null>(null)
const tone = computed(() => toneOn(props.product.color))
const fg = computed(() => toneVar(tone.value))
const btn = computed(() => (tone.value === 'light' ? 'yellow' : 'blue'))
const level = computed(() => art.value?.level ?? 0)
const done = computed(() => art.value?.done ?? false)

function onBite(p: { level: number; x: number; y: number }) {
  crumbs.value?.burst(p.x, p.y, props.product.crumbColor)
}
</script>

<template>
  <SectionWipe
    :id="product.slug"
    :data-slug="product.slug"
    :color="product.color"
    :prev-color="prevColor"
    class="scroll-mt-28 md:scroll-mt-32"
  >
    <div
      class="screen relative flex min-h-svh flex-col justify-center overflow-hidden px-4 pb-28 pt-24 md:pb-16 md:pt-28"
      :style="{ color: fg }"
    >
      <p
        class="giant pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none whitespace-nowrap text-center text-[clamp(5rem,26vw,24rem)] opacity-20"
        aria-hidden="true"
      >
        {{ product.name }}
      </p>
      <AmbientCrumbs :color="product.crumbColor" />

      <div
        class="wrap relative grid items-center gap-8 md:grid-cols-2 md:gap-14"
        :class="index % 2 ? 'md:[&>*:first-child]:order-2' : ''"
      >
        <div class="relative mx-auto w-[min(70vw,24rem)] md:w-[min(36vw,34rem)]">
          <div class="relative aspect-square"><BiteMask ref="art" :product="product" @bite="onBite" /></div>
          <div class="floor" aria-hidden="true" />
        </div>

        <div class="text">
          <p class="flex flex-wrap items-center gap-2 text-sm font-bold uppercase tracking-widest">
            <span>{{ product.range }}</span>
            <span
              v-if="highlighted"
              class="rounded-full bg-ok-yellow px-3 py-1 text-xs normal-case tracking-normal text-ok-blue"
              >{{ t('produits.first') }}</span
            >
            <PlaceholderBadge :show="product.placeholder" />
          </p>
          <h2 class="mt-2 text-[clamp(2.6rem,6.2vw,6rem)] !leading-[0.9] [overflow-wrap:anywhere]">
            {{ product.name }}
          </h2>
          <p class="sub mt-3">{{ product.tagline }}</p>
          <p class="mt-4 max-w-[46ch] text-[1.15rem] font-bold leading-snug">{{ product.description }}</p>
          <dl class="mt-5 grid max-w-md grid-cols-[auto_1fr] gap-x-5 gap-y-1 text-[1.05rem] font-bold">
            <dt class="opacity-90">{{ t('produits.format') }}</dt>
            <dd>{{ product.format }}</dd>
            <dt class="opacity-90">{{ t('produits.flavors') }}</dt>
            <dd>{{ product.flavors.join(' · ') }}</dd>
          </dl>
          <div class="mt-6 flex flex-wrap items-center gap-4">
            <Btn v-if="!done" :variant="btn" @click="art?.bite()">{{ t('produits.bite') }}</Btn>
            <Btn v-else :variant="btn" @click="art?.reset()">{{ t('produits.again') }}</Btn>
            <p class="font-bold" aria-live="polite">{{ level > 0 ? t('produits.level', { n: level }) : '' }}</p>
          </div>
        </div>
      </div>
      <Crumbs ref="crumbs" />
    </div>
  </SectionWipe>
</template>

<style scoped>
/* Ombre au sol (CSS pur) */
.floor {
  position: absolute;
  left: 12%;
  right: 12%;
  bottom: -4%;
  height: 9%;
  border-radius: 50%;
  background: radial-gradient(closest-side, color-mix(in srgb, var(--ok-ink) 42%, transparent), transparent);
}
</style>
