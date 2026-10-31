<script setup lang="ts">
import type { Croqueur, Produit } from '~/types/content'

/**
 * Mosaïque organique (formes irrégulières, coins " croqués "). Toute photo est affichée UNIQUEMENT si `consentement: true`.
 * Un tap ouvre une visionneuse <dialog> (swipe natif en scroll-snap, flèches clavier, Échap).
 */
const props = defineProps<{ items: Croqueur[]; products: Produit[] }>()
const { t } = useUi()
const { mode, isStatic } = useMotion()

const blobs = ['blob-a', 'blob-b', 'blob-c', 'blob-d']
const spans = ['row-span-2', '', 'md:col-span-2 md:row-span-2', 'row-span-2', '', '', 'md:row-span-2', '']
const tints = ['var(--ok-blue)', 'var(--ok-red-deep)', 'var(--ok-blue-soft)', 'var(--ok-blue-deep)']
const productOf = (c: Croqueur) => props.products.find((p) => p.slug === c.produit)
const captionParts = (c: Croqueur) =>
  [c.prenom, productOf(c)?.name, t(`moments.${c.moment}`)].filter(Boolean) as string[]

const dlg = ref<HTMLDialogElement>()
const track = ref<HTMLElement>()
const current = ref(0)
const root = ref<HTMLElement>()
let ctx: { revert: () => void } | null = null

async function open(i: number) {
  current.value = i
  dlg.value?.showModal()
  await nextTick()
  const w = track.value?.clientWidth ?? 0
  track.value?.scrollTo({ left: w * i, behavior: 'instant' as ScrollBehavior })
}
function go(delta: number) {
  const n = props.items.length
  const i = (current.value + delta + n) % n
  current.value = i
  track.value?.scrollTo({
    left: (track.value?.clientWidth ?? 0) * i,
    behavior: mode.value === 'static' ? ('instant' as ScrollBehavior) : 'smooth',
  })
}
let st: ReturnType<typeof setTimeout> | undefined
function onScroll() {
  clearTimeout(st)
  st = setTimeout(() => {
    const el = track.value
    if (el) current.value = Math.round(el.scrollLeft / Math.max(el.clientWidth, 1))
  }, 80)
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'ArrowRight') {
    e.preventDefault()
    go(1)
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    go(-1)
  }
}
function onBackdrop(e: MouseEvent) {
  if (e.target === dlg.value) dlg.value?.close()
}

onMounted(async () => {
  if (!root.value || mode.value === 'static') return
  const { gsap, ScrollTrigger } = await loadGsap()
  if (isStatic.value) return
  ctx = gsap.context(() => {
    const tiles = gsap.utils.toArray<HTMLElement>('[data-tile]', root.value!)
    gsap.set(tiles, { opacity: 0, scale: 0.86, y: 24 })
    // Apparition groupée, en cascade, quand les photos entrent à l'écran
    ScrollTrigger.batch(tiles, {
      start: 'top 92%',
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: mode.value === 'lite' ? 0.4 : 0.7,
          ease: 'back.out(1.5)',
          stagger: 0.07,
          overwrite: true,
        }),
    })
  }, root.value)
})
onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <section ref="root" class="bg-ok-cream px-4 py-16 text-ok-blue md:py-24" aria-labelledby="wall-title">
    <div class="wrap">
      <h2 id="wall-title" class="text-title">{{ t('parole.b.title') }}</h2>
      <p class="sub mt-3">{{ t('parole.b.intro') }}</p>

      <ul
        class="mt-10 grid auto-rows-[minmax(9rem,1fr)] grid-cols-2 gap-3 md:grid-cols-4 md:auto-rows-[minmax(12rem,1fr)] md:gap-5 [grid-auto-flow:dense]"
      >
        <li
          v-for="(c, i) in items"
          :key="c.id"
          data-tile
          class="flex min-h-0 flex-col"
          :class="[spans[i % spans.length], i % 2 ? 'md:translate-y-5' : '']"
        >
          <button
            type="button"
            class="tile group relative min-h-0 flex-1 overflow-hidden"
            :class="[blobs[i % 4], i % 3 === 0 ? 'bite-corner' : '']"
            :aria-label="t('parole.b.open', { name: c.prenom })"
            @click="open(i)"
          >
            <SmartImage
              :src="c.image"
              :alt="c.alt"
              :width="800"
              :height="1000"
              :force-placeholder="!c.consentement"
              variant="person"
              :tint="tints[i % 4]"
              :initials="initials(c.prenom)"
              class="!aspect-auto h-full w-full transition-transform duration-500 group-hover:scale-105"
            />
          </button>
          <p class="mt-2 text-sm font-bold leading-tight">
            <template v-for="(part, k) in captionParts(c)" :key="k"><Sep v-if="k" />{{ part }}</template>
          </p>
        </li>
      </ul>
    </div>

    <dialog
      ref="dlg"
      class="on-dark m-0 h-full max-h-none w-full max-w-none border-0 bg-ok-ink p-0 text-ok-white"
      :aria-label="t('parole.b.viewer')"
      @click="onBackdrop"
      @keydown="onKey"
    >
      <div class="flex h-full flex-col">
        <div class="flex items-center justify-between px-4 py-3">
          <p class="font-bold" aria-live="polite">{{ t('parole.b.of', { n: current + 1, total: items.length }) }}</p>
          <button
            type="button"
            class="grid h-12 w-12 place-items-center rounded-full border-2 border-current"
            :aria-label="t('a11y.close')"
            @click="dlg?.close()"
          >
            <UiIcon name="close" />
          </button>
        </div>
        <ul
          ref="track"
          class="flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto"
          style="overscroll-behavior-x: contain; scrollbar-width: none"
          @scroll="onScroll"
        >
          <li
            v-for="(c, i) in items"
            :key="c.id"
            class="grid min-w-full snap-center grid-rows-[1fr_auto] gap-4 px-4 pb-6 md:grid-cols-2 md:grid-rows-1 md:items-center md:gap-10 md:px-16"
          >
            <div class="mx-auto h-full max-h-[70svh] w-full max-w-md overflow-hidden rounded-3xl">
              <SmartImage
                :src="c.image"
                :alt="c.alt"
                :width="800"
                :height="1000"
                :force-placeholder="!c.consentement"
                variant="person"
                :tint="tints[i % 4]"
                :initials="initials(c.prenom)"
                :eager="Math.abs(i - current) <= 1"
                class="!aspect-auto h-full w-full"
              />
            </div>
            <div class="md:max-w-md">
              <p class="font-display text-[clamp(1.8rem,5vw,3.4rem)] leading-[1.02]">
                <UiIcon name="quote" size="mr-[0.15em] inline-block h-[0.65em] w-[0.65em]" />{{ c.phrase
                }}<UiIcon name="quote" size="ml-[0.15em] inline-block h-[0.65em] w-[0.65em] rotate-180" />
              </p>
              <p class="mt-3 text-lg font-bold">
                {{ c.prenom }}<Sep />{{ c.ville }} <PlaceholderBadge :show="c.placeholder" />
              </p>
              <p class="text-lg">{{ productOf(c)?.name }}<Sep />{{ t(`moments.${c.moment}`) }}</p>
            </div>
          </li>
        </ul>
        <div class="flex justify-center gap-3 pb-6">
          <Btn variant="yellow" :aria-label="t('a11y.prev')" @click="go(-1)"><UiIcon name="arrow-left" /></Btn>
          <Btn variant="yellow" :aria-label="t('a11y.next')" @click="go(1)"><UiIcon name="arrow-right" /></Btn>
        </div>
      </div>
    </dialog>
  </section>
</template>
