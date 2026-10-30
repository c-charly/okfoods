<script setup lang="ts">
import type { Avis } from '~/types/content'

/**
 * « Je mange OK Foods quand… » : les réponses défilent comme sur un tableau de gare.
 * Pause possible (WCAG 2.2.2). Reduced-motion : liste statique. La liste complète est toujours disponible en texte.
 */
const props = defineProps<{ avis: Avis[] }>()
const { t } = useUi()
const { mode } = useMotion()
const idx = ref(0)
const playing = ref(true)
const visible = ref(false)
const showAll = ref(false)
const root = ref<HTMLElement>()
let timer: ReturnType<typeof setInterval> | null = null
let io: IntersectionObserver | null = null

const current = computed(() => props.avis[idx.value % Math.max(props.avis.length, 1)])
const letters = computed(() => Array.from(current.value?.completion ?? ''))
const flip = computed(() => letters.value.length <= 38)

function sync() {
  if (timer) clearInterval(timer)
  timer = null
  if (playing.value && visible.value && mode.value !== 'static' && props.avis.length > 1)
    timer = setInterval(() => {
      idx.value = (idx.value + 1) % props.avis.length
    }, 3400)
}
watch([playing, visible, mode], sync)
onMounted(() => {
  if (mode.value === 'static') showAll.value = true
  io = new IntersectionObserver(([e]) => (visible.value = !!e?.isIntersecting))
  if (root.value) io.observe(root.value)
})
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  io?.disconnect()
})
</script>

<template>
  <section
    ref="root"
    class="on-dark relative overflow-hidden bg-ok-blue px-4 pb-16 pt-12 text-ok-white md:pb-24 md:pt-20"
    aria-labelledby="parole-title"
  >
    <div class="wrap">
      <h1 id="parole-title" class="font-display text-[clamp(1.4rem,3vw,2rem)] text-ok-yellow">
        {{ t('parole.title') }}
      </h1>
      <p class="giant mt-6 text-[clamp(2.8rem,10.5vw,9.5rem)] !leading-[0.88]">{{ t('parole.a.lead') }}</p>

      <div class="board mt-8 min-h-[7rem] bg-ok-blue-deep p-5 md:min-h-[9rem] md:p-8" aria-live="off">
        <p
          v-if="current"
          :key="idx"
          class="font-display text-[clamp(1.8rem,6vw,4.6rem)] leading-[1] text-ok-yellow"
          :class="{ 'ticker-flip': flip }"
        >
          <template v-if="flip"
            ><span
              v-for="(c, i) in letters"
              :key="i"
              class="ticker-letter"
              :style="{ animationDelay: `${i * 24}ms` }"
              >{{ c === ' ' ? '\u00A0' : c }}</span
            ></template
          >
          <template v-else>{{ current.completion }}</template>
        </p>
        <p v-if="current" class="mt-3 text-lg font-bold">
          {{ t('parole.a.by') }} {{ current.prenom }}, {{ current.ville }}
          <PlaceholderBadge :show="current.placeholder" />
        </p>
      </div>

      <div class="mt-5 flex flex-wrap items-center gap-3">
        <Btn variant="ghost" class="ticker-pause" :aria-pressed="!playing" @click="playing = !playing">{{
          playing ? t('a11y.pause') : t('a11y.play')
        }}</Btn>
        <Btn variant="yellow" :aria-expanded="showAll" aria-controls="all-answers" @click="showAll = !showAll">{{
          showAll ? t('parole.a.hide') : t('parole.a.all')
        }}</Btn>
      </div>

      <ul
        v-show="showAll"
        id="all-answers"
        class="mt-6 grid gap-x-10 border-t-2 border-ok-yellow md:grid-cols-2"
        :aria-label="t('parole.a.list')"
      >
        <li v-for="(a, i) in avis" :key="i" class="border-b border-ok-white/40 py-3">
          <span class="font-bold">{{ a.completion }}</span>
          <span class="opacity-90">— {{ a.prenom }}, {{ a.ville }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>

<style>
.ticker-letter {
  display: inline-block;
  animation: ok-flap-in 0.42s var(--ease-out) both;
  transform-origin: 50% 100%;
}
.ticker-flip {
  perspective: 700px;
}
html[data-motion='lite'] .ticker-letter {
  animation: none;
}
</style>
