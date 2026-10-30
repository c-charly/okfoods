<script setup lang="ts">
/** Apparition au scroll. Contenu toujours présent dans le DOM : sans JS, sans GSAP ou en reduced-motion, tout reste visible. */
const props = withDefaults(defineProps<{ tag?: string; y?: number; delay?: number; duration?: number }>(), {
  tag: 'div',
  y: 36,
  delay: 0,
  duration: 0.8,
})
const el = ref<HTMLElement>()
const { mode, isStatic } = useMotion()
let tween: { kill: () => void } | null = null

onMounted(async () => {
  const node = el.value
  if (!node || mode.value === 'static') return
  const r = node.getBoundingClientRect()
  if (r.top < window.innerHeight * 0.92) return // déjà visible : pas de flash
  const { gsap } = await loadGsap()
  if (isStatic.value) return
  tween = gsap.from(node, {
    y: mode.value === 'lite' ? props.y * 0.5 : props.y,
    opacity: 0,
    duration: mode.value === 'lite' ? 0.45 : props.duration,
    delay: props.delay,
    ease: 'power2.out',
    clearProps: 'transform,opacity',
    scrollTrigger: { trigger: node, start: 'top 90%', once: true },
  })
})
onBeforeUnmount(() => tween?.kill())
</script>

<template>
  <component :is="tag" ref="el"><slot /></component>
</template>
