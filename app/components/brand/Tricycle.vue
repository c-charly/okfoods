<script setup lang="ts">
/** Tricycle OK Foods (SVG dessiné). Les roues tournent quand `moving` est vrai. Décoratif. */
defineProps<{ moving?: boolean }>()
</script>

<template>
  <svg viewBox="0 0 170 112" aria-hidden="true" class="tricycle" :class="{ moving }">
    <path d="M8 28 Q50 -6 92 28 Z" class="f-yellow" />
    <path d="M50 14 V30" class="s-ink" stroke-width="3" fill="none" />
    <rect x="14" y="30" width="72" height="42" rx="7" class="f-blue" />
    <rect x="14" y="54" width="72" height="9" class="f-red" />
    <text x="50" y="50" text-anchor="middle" font-size="17" class="font-display f-yellow">OK</text>
    <path
      d="M86 70 H110 L126 42 M110 70 L100 90 M126 42 H138 M126 42 L142 90"
      class="s-ink"
      stroke-width="4"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <rect x="96" y="52" width="20" height="7" rx="3" class="f-red" />
    <g class="wheel">
      <circle cx="38" cy="92" r="17" fill="none" class="s-ink" stroke-width="4" />
      <path d="M38 76 V108 M22 92 H54 M26 80 L50 104" class="s-ink" stroke-width="2" />
      <circle cx="38" cy="92" r="3.5" class="f-red" />
    </g>
    <g class="wheel">
      <circle cx="142" cy="92" r="17" fill="none" class="s-ink" stroke-width="4" />
      <path d="M142 76 V108 M126 92 H158 M130 80 L154 104" class="s-ink" stroke-width="2" />
      <circle cx="142" cy="92" r="3.5" class="f-red" />
    </g>
  </svg>
</template>

<style scoped>
.wheel {
  transform-box: fill-box;
  transform-origin: center;
}
.moving .wheel {
  animation: ok-spin 0.9s linear infinite;
}
</style>
