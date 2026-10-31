<script setup lang="ts">
import { ENVIES, type Envie } from '~~/config/envies'
import type { Produit } from '~/types/content'

/** Accueil 2/6 - " T'as envie de quoi ? " : 4 bulles typographiques ; le choix met en avant les produits correspondants (champ `envies`). */
const props = defineProps<{ products: Produit[] }>()
const { t } = useUi()
const { envie, setEnvie } = useEnvie()
const localePath = useLocalePath()
const crumbs = ref<{ burst: (x: number, y: number, c: string, n?: number) => void }>()
const popped = ref<Envie | null>(null)

const look: Record<Envie, string> = {
  croquant: 'bg-ok-yellow text-ok-blue blob-a',
  fondant: 'bg-ok-red-deep text-ok-white blob-b',
  sucre: 'bg-ok-cream text-ok-blue blob-c',
  fruite: 'bg-ok-blue-soft text-ok-white blob-d',
}
const matches = computed(() => (envie.value ? props.products.filter((p) => p.envies.includes(envie.value!)) : []))

function pick(e: Envie, ev: MouseEvent) {
  setEnvie(envie.value === e ? null : e)
  popped.value = e
  window.setTimeout(() => {
    popped.value = null
  }, 420)
  const first = props.products.find((p) => p.envies.includes(e))
  const r = (ev.currentTarget as HTMLElement).getBoundingClientRect()
  if (first && envie.value === e) crumbs.value?.burst(r.left + r.width / 2, r.top + r.height / 2, first.crumbColor, 18)
}
</script>

<template>
  <section
    class="on-dark relative overflow-hidden bg-ok-blue px-4 py-16 text-ok-white md:py-24"
    aria-labelledby="envie-title"
  >
    <div class="wrap relative">
      <Reveal tag="div">
        <h2 id="envie-title" class="text-title">{{ t('home.envie.title') }}</h2>
        <p class="sub mt-3 text-ok-yellow">{{ t('home.envie.hint') }}</p>
      </Reveal>

      <ul class="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        <li v-for="(e, i) in ENVIES" :key="e" class="envie-cell" :style="{ '--i': i }">
          <button
            type="button"
            class="envie-bubble anim-heavy grid aspect-square w-full place-items-center p-3 font-display text-[clamp(1.7rem,6.5vw,3.4rem)] leading-none shadow-[0_14px_0_-6px_color-mix(in_srgb,var(--ok-ink)_45%,transparent)]"
            :class="[look[e], envie === e ? 'is-on' : '', popped === e ? 'is-pop' : '']"
            :aria-pressed="envie === e"
            @click="pick(e, $event)"
          >
            {{ t(`envies.${e}`) }}
          </button>
        </li>
      </ul>

      <div class="mt-12 min-h-[14rem]" aria-live="polite">
        <p v-if="!envie" class="sub text-center text-ok-white/90">{{ t('home.envie.none') }}</p>
        <template v-else>
          <p class="font-display mb-6 text-center text-2xl text-ok-yellow">
            {{ t('home.envie.pick', { envie: t(`envies.${envie}`).toLowerCase() }) }}
          </p>
          <ul class="flex flex-wrap items-end justify-center gap-x-8 gap-y-6">
            <li v-for="p in matches" :key="p.slug" class="envie-match flex flex-col items-center text-center">
              <ProductArt :product="p" size="clamp(8rem, 22vw, 13rem)" />
              <NuxtLink
                :to="`${localePath('/produits')}#${p.slug}`"
                class="font-display mt-2 min-h-11 text-xl text-ok-white no-underline hover:text-ok-yellow"
                >{{ p.name }}</NuxtLink
              >
            </li>
          </ul>
          <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Btn to="/produits" variant="yellow">{{ t('home.envie.see') }}</Btn>
            <Btn variant="ghost" @click="setEnvie(null)">{{ t('home.envie.reset') }}</Btn>
          </div>
        </template>
      </div>
    </div>
    <Crumbs ref="crumbs" />
  </section>
</template>

<style>
.envie-bubble {
  transition: transform 0.3s var(--ease-spring);
  animation: ok-float 6s ease-in-out infinite;
  animation-delay: calc(var(--i) * -1.4s);
}
.envie-bubble:hover {
  transform: scale(1.05);
}
.envie-bubble.is-on {
  transform: scale(1.08);
  outline: 4px solid var(--ok-yellow);
  outline-offset: 4px;
}
.envie-bubble.is-pop {
  animation: ok-bounce 0.42s var(--ease-out);
}
.envie-match {
  animation: envie-pop-in 0.5s var(--ease-spring) both;
}
@keyframes envie-pop-in {
  from {
    transform: scale(0.6);
    opacity: 0;
  }
}
html[data-motion='lite'] .envie-bubble {
  animation: none;
}
</style>
