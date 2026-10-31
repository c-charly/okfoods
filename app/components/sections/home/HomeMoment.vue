<script setup lang="ts">
import { MOMENTS, type Moment } from '~~/config/moments'
import type { Produit } from '~/types/content'

/** Accueil 3/6 - " L'heure de la pause " : le fond, le ciel SVG et la phrase changent ; un produit est suggéré. */
const props = defineProps<{ products: Produit[] }>()
const { t } = useUi()
const { moment, setMoment, envie } = useEnvie()
const localePath = useLocalePath()

const theme: Record<Moment | 'none', string> = {
  none: 'bg-ok-cream text-ok-blue',
  matin: 'bg-ok-yellow text-ok-blue',
  midi: 'bg-ok-cream text-ok-blue',
  gouter: 'bg-ok-red-deep text-ok-white',
  soir: 'bg-ok-blue-deep text-ok-white',
}
const sun: Record<Moment | 'none', { x: number; y: number; moon: boolean }> = {
  none: { x: 50, y: 30, moon: false },
  matin: { x: 16, y: 72, moon: false },
  midi: { x: 50, y: 14, moon: false },
  gouter: { x: 84, y: 48, moon: false },
  soir: { x: 78, y: 22, moon: true },
}
const key = computed(() => moment.value ?? 'none')
const s = computed(() => sun[key.value])
const suggestion = computed(() => {
  if (!moment.value) return null
  const byMoment = props.products.filter((p) => p.moments?.includes(moment.value!))
  const pool = (envie.value ? byMoment.filter((p) => p.envies.includes(envie.value!)) : []).concat(
    byMoment,
    props.products,
  )
  return pool[0] ?? null
})
</script>

<template>
  <section
    class="moment relative overflow-hidden px-4 py-16 transition-colors duration-700 md:py-24"
    :class="theme[key]"
    aria-labelledby="moment-title"
  >
    <svg
      viewBox="0 0 100 60"
      preserveAspectRatio="xMidYMid slice"
      class="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <g class="orb" :style="{ transform: `translate(${s.x}px, ${s.y * 0.6}px)` }">
        <circle r="9" :class="s.moon ? 'f-cream' : 'f-red'" />
        <circle v-if="s.moon" cx="4" cy="-2" r="7.5" class="f-blue-deep" />
      </g>
      <g class="cloud" opacity="0.8">
        <ellipse cx="20" cy="14" rx="11" ry="3.4" class="f-white" opacity="0.7" />
        <ellipse cx="28" cy="12" rx="7" ry="3" class="f-white" opacity="0.7" />
        <ellipse cx="74" cy="40" rx="12" ry="3.4" class="f-white" opacity="0.5" />
      </g>
      <g v-if="s.moon" class="f-yellow">
        <circle cx="12" cy="10" r="0.6" />
        <circle cx="36" cy="22" r="0.5" />
        <circle cx="58" cy="8" r="0.6" />
        <circle cx="90" cy="38" r="0.5" />
        <circle cx="22" cy="44" r="0.5" />
      </g>
    </svg>

    <div class="wrap relative">
      <h2 id="moment-title" class="text-title">{{ t('home.moment.title') }}</h2>
      <p class="sub mt-3">{{ t('home.moment.hint') }}</p>

      <div class="mt-8 flex gap-3 overflow-x-auto pb-2" role="group" :aria-label="t('home.moment.title')">
        <button
          v-for="m in MOMENTS"
          :key="m"
          type="button"
          class="min-h-12 shrink-0 rounded-full border-2 border-current px-5 text-lg font-bold transition-colors"
          :class="moment === m ? 'bg-ok-blue !border-ok-blue text-ok-white' : 'bg-transparent'"
          :aria-pressed="moment === m"
          @click="setMoment(moment === m ? null : m)"
        >
          {{ t(`moments.${m}`) }}
        </button>
      </div>

      <div class="mt-10 min-h-[12rem]" aria-live="polite">
        <template v-if="moment">
          <p class="font-display max-w-[22ch] text-[clamp(1.8rem,5vw,3.4rem)] leading-[1]">
            {{ t(`home.moment.phrases.${moment}`) }}
          </p>
          <div v-if="suggestion" class="mt-6 flex items-center gap-5">
            <ProductArt :product="suggestion" size="clamp(6rem, 18vw, 10rem)" />
            <div>
              <p class="sub">{{ t('home.moment.suggest') }}</p>
              <p class="font-display text-3xl">{{ suggestion.name }}</p>
              <NuxtLink
                :to="`${localePath('/produits')}#${suggestion.slug}`"
                class="mt-1 inline-flex min-h-11 items-center font-bold underline"
                >{{ t('home.moment.discover') }} <UiIcon name="arrow-right" size="h-5 w-5"
              /></NuxtLink>
            </div>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
.orb {
  transition: transform 0.9s var(--ease-out);
}
.moment :deep(.orb) {
  transform-box: view-box;
}
</style>
