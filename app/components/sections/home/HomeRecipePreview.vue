<script setup lang="ts">
import type { Etape } from '~/types/content'

/** Accueil 5/6 — aperçu de la recette : 3 étapes, chiffres géants qui s'incrémentent, icônes SVG animées. */
defineProps<{ steps: Etape[] }>()
const { t } = useUi()
const { mode, isStatic } = useMotion()
const root = ref<HTMLElement>()
const active = ref(false)
let ctx: { revert: () => void } | null = null
let io: IntersectionObserver | null = null
const pad = (n: number) => String(n).padStart(2, '0')

onMounted(async () => {
  if (!root.value) return
  io = new IntersectionObserver(([e]) => (active.value = !!e?.isIntersecting), { threshold: 0.25 })
  io.observe(root.value)
  if (mode.value === 'static') return
  const { gsap } = await loadGsap()
  if (isStatic.value) return
  ctx = gsap.context(() => {
    gsap.utils.toArray<HTMLElement>('[data-count]', root.value!).forEach((el) => {
      const end = Number(el.dataset.count)
      const o = { v: 0 }
      gsap.to(o, {
        v: end,
        duration: 1.2,
        ease: 'power2.out',
        snap: { v: 1 },
        onUpdate: () => {
          el.textContent = pad(o.v)
        },
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      })
      el.textContent = pad(0)
    })
  }, root.value)
})
onBeforeUnmount(() => {
  ctx?.revert()
  io?.disconnect()
})
</script>

<template>
  <section ref="root" class="on-dark bg-ok-blue-deep px-4 py-16 text-ok-white md:py-24" aria-labelledby="recipe-prev">
    <div class="wrap">
      <h2 id="recipe-prev" class="text-title">{{ t('home.recipe.title') }}</h2>
      <p class="sub mt-3 text-ok-yellow">{{ t('home.recipe.intro') }}</p>
      <ol class="mt-10 grid gap-10 md:grid-cols-3">
        <li v-for="s in steps" :key="s.n" class="flex items-center gap-5 md:flex-col md:items-start">
          <div class="h-28 w-28 shrink-0 md:h-40 md:w-40"><RecipeIcon :name="s.icone" :active="active" /></div>
          <div>
            <p class="giant text-[clamp(4rem,12vw,8rem)] !leading-[0.8] text-ok-yellow" :data-count="s.n">
              {{ pad(s.n) }}
            </p>
            <h3 class="mt-2 text-3xl">{{ s.titre }}</h3>
            <p class="mt-1 max-w-[34ch]">{{ s.texte }}</p>
          </div>
        </li>
      </ol>
      <div class="mt-10">
        <Btn to="/recette" variant="yellow">{{ t('home.recipe.more') }} →</Btn>
      </div>
    </div>
  </section>
</template>
