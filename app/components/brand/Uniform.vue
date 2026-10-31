<script setup lang="ts">
/** Polo " team bleue " dessiné en SVG (décoratif). */
</script>

<template>
  <svg viewBox="0 0 200 200" aria-hidden="true" class="uniform">
    <path
      d="M62 24 L38 38 L10 74 L38 96 L52 84 V176 H148 V84 L162 96 L190 74 L162 38 L138 24 Q100 52 62 24 Z"
      class="f-blue"
    />
    <path d="M62 24 Q100 52 138 24 L128 20 Q100 40 72 20 Z" class="f-yellow" />
    <path d="M10 74 L38 96 L44 90 L18 68 Z M190 74 L162 96 L156 90 L182 68 Z" class="f-red" />
    <circle cx="124" cy="84" r="17" class="f-red" />
    <text x="124" y="91" text-anchor="middle" font-size="19" class="font-display f-white">OK</text>
    <rect x="52" y="140" width="96" height="10" class="f-yellow" />
  </svg>
</template>
