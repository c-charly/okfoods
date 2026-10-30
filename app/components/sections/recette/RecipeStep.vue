<script setup lang="ts">
import type { Etape } from '~/types/content'

/** Une étape de la recette : chiffre géant, titre, 2–3 phrases, fait clé, icône SVG animée (ou photo `usine-0X` si elle existe). */
const props = defineProps<{ step: Etape; index: number }>()
const { t } = useUi()
const images = useImages()
const root = ref<HTMLElement>()
const active = ref(false)
let io: IntersectionObserver | null = null

const themes = [
  'bg-ok-blue text-ok-white on-dark',
  'bg-ok-red-deep text-ok-white on-dark',
  'bg-ok-blue-deep text-ok-white on-dark',
  'bg-ok-yellow text-ok-blue',
  'bg-ok-blue-soft text-ok-white on-dark',
  'bg-ok-cream text-ok-blue',
]
const photoPath = computed(() => props.step.image ?? `/images/usine/usine-0${props.step.n}.jpg`)
const hasPhoto = computed(() => images.has(photoPath.value))
const pad = (n: number) => String(n).padStart(2, '0')

onMounted(() => {
  if (!root.value) return
  io = new IntersectionObserver(([e]) => (active.value = !!e?.isIntersecting), { threshold: 0.3 })
  io.observe(root.value)
})
onBeforeUnmount(() => io?.disconnect())
</script>

<template>
  <section
    ref="root"
    class="step relative flex min-h-svh items-center overflow-hidden px-4 py-20 md:sticky md:top-14 md:min-h-[calc(100svh-3.5rem)]"
    :class="themes[index % themes.length]"
    :aria-labelledby="`step-${step.n}`"
  >
    <div class="wrap grid items-center gap-8 md:grid-cols-2 md:gap-16">
      <div :class="index % 2 ? 'md:order-2' : ''">
        <p class="giant text-[clamp(7rem,30vw,22rem)] !leading-[0.75] opacity-95">{{ pad(step.n) }}</p>
        <p class="sub mt-4">{{ t('recette.step') }} {{ step.n }}</p>
        <h2 :id="`step-${step.n}`" class="text-title mt-1">{{ step.titre }}</h2>
        <p class="mt-4 max-w-[44ch] text-[1.2rem] font-bold leading-snug">{{ step.texte }}</p>
        <p class="mt-5 inline-flex flex-col border-l-4 border-current pl-4">
          <span class="text-sm font-bold uppercase tracking-widest">{{ t('recette.key') }}</span>
          <span class="font-display text-2xl leading-tight">{{ step.chiffre }}</span>
        </p>
        <p v-if="step.placeholder" class="mt-3"><PlaceholderBadge show /></p>
      </div>
      <div class="mx-auto w-full max-w-md" :class="index % 2 ? 'md:order-1' : ''">
        <SmartImage v-if="hasPhoto" :src="photoPath" :alt="step.titre" :width="1200" :height="800" class="blob-a" />
        <div v-else class="aspect-square w-full"><RecipeIcon :name="step.icone" :active="active" /></div>
      </div>
    </div>
  </section>
</template>
