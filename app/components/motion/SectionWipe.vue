<script setup lang="ts">
/**
 * Balayage de couleur : la couleur de la section suivante monte et recouvre l'écran (scrub au scroll, transform uniquement).
 * Le contenu apparaît en fondu en fin de balayage. Statique : couleur et contenu directement visibles.
 */
defineProps<{ color: string; prevColor: string }>()
const root = ref<HTMLElement>()
const layer = ref<HTMLElement>()
const content = ref<HTMLElement>()
const { mode, isStatic } = useMotion()
let ctx: { revert: () => void } | null = null

onMounted(async () => {
  if (mode.value === 'static' || !root.value || !layer.value || !content.value) return
  const { gsap } = await loadGsap()
  if (isStatic.value) return
  const lite = mode.value === 'lite'
  ctx = gsap.context(() => {
    gsap.fromTo(
      layer.value!,
      { yPercent: 100 },
      {
        yPercent: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: root.value,
          start: 'top bottom',
          end: lite ? 'top 35%' : 'top top',
          scrub: lite ? true : 0.4,
        },
      },
    )
    gsap.fromTo(
      content.value!,
      { opacity: 0 },
      {
        opacity: 1,
        ease: 'none',
        scrollTrigger: { trigger: root.value, start: 'top 72%', end: 'top 30%', scrub: true },
      },
    )
  }, root.value)
})
onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <section ref="root" class="relative min-h-svh overflow-clip" :style="{ background: prevColor }">
    <div
      ref="layer"
      class="bite-top absolute inset-0 will-change-transform"
      :style="{ background: color }"
      aria-hidden="true"
    />
    <div ref="content" class="relative z-10 min-h-svh"><slot /></div>
  </section>
</template>
