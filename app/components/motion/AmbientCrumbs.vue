<script setup lang="ts">
/** Miettes d'ambiance (CSS pur, transform/opacity uniquement). Moins nombreuses en mode allégé, absentes en statique (voir main.css). */
defineProps<{ color: string }>()
const root = ref<HTMLElement>()
const paused = ref(true)
let io: IntersectionObserver | null = null
const items = Array.from({ length: 14 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  size: 5 + ((i * 7) % 9),
  delay: -((i * 1.7) % 11),
  dur: 11 + ((i * 3) % 7),
  dx: (i % 2 ? 1 : -1) * (14 + ((i * 13) % 46)),
  rot: 120 + ((i * 41) % 260),
  shape: i % 3,
}))
onMounted(() => {
  if (!root.value) return
  io = new IntersectionObserver(([e]) => (paused.value = !e?.isIntersecting))
  io.observe(root.value)
})
onBeforeUnmount(() => io?.disconnect())
</script>

<template>
  <div
    ref="root"
    class="ambient pointer-events-none absolute inset-0 overflow-hidden"
    :class="{ paused }"
    aria-hidden="true"
  >
    <span
      v-for="(c, i) in items"
      :key="i"
      class="crumb absolute top-0 block"
      :style="{
        left: `${c.left}%`,
        width: `${c.size}px`,
        height: `${c.shape === 2 ? c.size * 0.7 : c.size}px`,
        background: color,
        borderRadius: c.shape === 1 ? '50%' : '2px',
        animationDuration: `${c.dur}s`,
        animationDelay: `${c.delay}s`,
        '--dx': `${c.dx}px`,
        '--rot': `${c.rot}deg`,
      }"
    />
  </div>
</template>

<style>
.ambient .crumb {
  animation: ok-drift linear infinite;
  opacity: 0;
}
.ambient.paused .crumb {
  animation-play-state: paused;
}
html[data-motion='lite'] .ambient .crumb:nth-child(n + 7) {
  display: none;
}
html[data-motion='static'] .ambient {
  display: none;
}
</style>
