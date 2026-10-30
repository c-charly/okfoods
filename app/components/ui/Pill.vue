<script setup lang="ts">
/** Pastille (filtre, index). Zone tactile ≥ 44 px. */
defineProps<{ active?: boolean; as?: 'button' | 'a'; href?: string }>()
</script>

<template>
  <component
    :is="as ?? 'button'"
    :href="href"
    :type="as === 'a' ? undefined : 'button'"
    :aria-pressed="as === 'a' ? undefined : active"
    :aria-current="as === 'a' && active ? 'true' : undefined"
    class="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-current px-4 text-base font-bold leading-none no-underline transition-colors duration-200"
    :class="active ? 'bg-ok-yellow text-ok-blue !border-ok-yellow' : 'bg-transparent'"
  >
    <slot />
  </component>
</template>
