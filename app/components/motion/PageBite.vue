<script setup lang="ts">
/** Transition entre pages : morsure (desktop avec souris, mouvement complet). Mobile : simple fondu (CSS .page-*). */
const on = ref(false)
const { mode, finePointer } = useMotion()
const nuxtApp = useNuxtApp()
const bites = [
  [12, 20, 30],
  [38, 8, 28],
  [64, 18, 32],
  [88, 10, 26],
  [22, 52, 34],
  [52, 48, 36],
  [80, 56, 32],
  [10, 86, 30],
  [40, 90, 30],
  [68, 88, 34],
  [94, 84, 28],
]
nuxtApp.hook('page:start', () => {
  if (mode.value === 'full' && finePointer.value) on.value = true
})
nuxtApp.hook('page:transition:finish', () => {
  on.value = false
})
</script>

<template>
  <div class="bite-overlay" :class="{ on }" aria-hidden="true">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="h-full w-full">
      <circle v-for="(b, i) in bites" :key="i" :cx="b[0]" :cy="b[1]" :r="b[2]" class="f-blue" :style="{ '--i': i }" />
    </svg>
  </div>
</template>

<style scoped>
.bite-overlay {
  position: fixed;
  inset: 0;
  z-index: 90;
  pointer-events: none;
  display: none;
}
@media (hover: hover) and (pointer: fine) and (min-width: 1024px) {
  .bite-overlay {
    display: block;
  }
}
circle {
  transform: scale(0);
  transform-box: fill-box;
  transform-origin: center;
  transition: transform 0.32s var(--ease-out) calc(var(--i) * 12ms);
}
.on circle {
  transform: scale(1.15);
}
.bite-overlay:not(.on) circle {
  transition-delay: calc(var(--i) * 10ms + 80ms);
}
</style>
