<script setup lang="ts">
import type { Avis } from '~/types/content'

/**
 * "Je mange OK Foods quand..." : les reponses defilent verticalement, comme sur un tableau de gare.
 * La reponse suivante monte depuis le bas et pousse la precedente vers le haut (sortie par le haut).
 * Pause possible (WCAG 2.2.2). Animations reduites : pas de mouvement. La liste complete reste disponible en texte.
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
// La plus longue reponse sert de gabarit invisible : la hauteur du tableau ne change jamais pendant le defilement
const longest = computed(() =>
  props.avis.reduce((a, b) => (b.completion.length > (a?.completion.length ?? 0) ? b : a), props.avis[0]),
)

function sync() {
  if (timer) clearInterval(timer)
  timer = null
  if (playing.value && visible.value && mode.value !== 'static' && props.avis.length > 1) {
    timer = setInterval(() => {
      idx.value = (idx.value + 1) % props.avis.length
    }, 3400)
  }
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

      <div class="mt-8 bg-ok-blue-deep p-5 md:p-8" aria-live="off">
        <div class="ticker-window relative overflow-hidden">
          <!-- Gabarit invisible : reserve la hauteur de la plus longue reponse -->
          <div v-if="longest" class="invisible" aria-hidden="true">
            <p class="font-display text-[clamp(1.8rem,6vw,4.6rem)] leading-[1]">{{ longest.completion }}</p>
            <p class="mt-3 text-lg font-bold">{{ t('parole.a.by') }} {{ longest.prenom }}, {{ longest.ville }}</p>
          </div>
          <!-- La nouvelle reponse monte du bas, l'ancienne repart vers le haut, en meme temps -->
          <Transition name="ticker">
            <div v-if="current" :key="idx" class="ticker-slide absolute inset-x-0 top-0">
              <p class="font-display text-[clamp(1.8rem,6vw,4.6rem)] leading-[1] text-ok-yellow">
                {{ current.completion }}
              </p>
              <p class="mt-3 text-lg font-bold">
                {{ t('parole.a.by') }} {{ current.prenom }}, {{ current.ville }}
                <PlaceholderBadge :show="current.placeholder" />
              </p>
            </div>
          </Transition>
        </div>
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
          <span class="opacity-90">- {{ a.prenom }}, {{ a.ville }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>

<style>
/* Styles non scopes : les selecteurs html[data-motion] ne survivent pas a `scoped` + `:global()` */
.ticker-enter-active,
.ticker-leave-active {
  transition:
    transform 0.65s var(--ease-out),
    opacity 0.65s ease;
}
.ticker-enter-from {
  transform: translateY(105%);
  opacity: 0;
}
.ticker-leave-to {
  transform: translateY(-105%);
  opacity: 0;
}
html[data-motion='lite'] .ticker-enter-active,
html[data-motion='lite'] .ticker-leave-active {
  transition-duration: 0.4s;
}
html[data-motion='static'] .ticker-pause {
  display: none;
}
</style>
