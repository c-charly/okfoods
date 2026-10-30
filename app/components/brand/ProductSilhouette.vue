<script setup lang="ts">
/** Silhouette de repli (sachet, biscuit ou bonbon) dessinée en SVG, repère 0–100. À placer dans un <svg viewBox="0 0 100 100">. */
const props = defineProps<{ kind: 'biscuit' | 'sachet' | 'bonbon'; name: string; color: string; accent: string }>()
// Le fond d'un écran produit a la couleur du produit : le corps de la silhouette prend donc la couleur d'accent.
const tone = computed(() => (toneOn(props.accent) === 'light' ? 'f-white' : 'f-ink'))

const lines = computed(() => {
  const w = props.name.trim().split(/\s+/)
  if (w.length < 2) return w
  const mid = Math.ceil(w.length / 2)
  return [w.slice(0, mid).join(' '), w.slice(mid).join(' ')]
})
const fontSize = computed(() => {
  const max = Math.max(...lines.value.map((l) => l.length), 1)
  const width = props.kind === 'sachet' ? 42 : props.kind === 'bonbon' ? 34 : 56
  return Math.max(5.5, Math.min(12, (width / max) * 1.75))
})
const startY = computed(() => 52 - ((lines.value.length - 1) * fontSize.value * 1.05) / 2 + fontSize.value * 0.35)

// Sachet : bords crantés haut et bas
const sachetPath = computed(() => {
  const teeth = 6
  const step = 48 / teeth
  let d = 'M26 14'
  for (let i = 0; i < teeth; i++) d += ` L${26 + step * i + step / 2} 10 L${26 + step * (i + 1)} 14`
  d += ' L74 86'
  for (let i = teeth; i > 0; i--) d += ` L${26 + step * i - step / 2} 90 L${26 + step * (i - 1)} 86`
  return `${d} Z`
})
const dots = [
  [34, 34],
  [66, 36],
  [30, 62],
  [70, 64],
  [50, 22],
  [52, 80],
]
</script>

<template>
  <g>
    <template v-if="kind === 'biscuit'">
      <circle cx="50" cy="50" r="40" :style="{ fill: accent }" />
      <circle
        cx="50"
        cy="50"
        r="34"
        fill="none"
        stroke-width="1.6"
        stroke-dasharray="3 3.4"
        :style="{ stroke: color }"
      />
      <circle v-for="(d, i) in dots" :key="i" :cx="d[0]" :cy="d[1]" r="1.7" :style="{ fill: color }" />
    </template>
    <template v-else-if="kind === 'sachet'">
      <path :d="sachetPath" :style="{ fill: accent }" />
      <rect x="26" y="19" width="48" height="3" :style="{ fill: color }" />
      <rect x="26" y="78" width="48" height="3" :style="{ fill: color }" />
    </template>
    <template v-else>
      <path d="M30 50 L8 34 Q5 50 8 66 Z" :style="{ fill: color }" />
      <path d="M70 50 L92 34 Q95 50 92 66 Z" :style="{ fill: color }" />
      <ellipse cx="50" cy="50" rx="26" ry="21" :style="{ fill: accent }" />
      <path d="M34 38 Q50 30 66 38" fill="none" stroke-width="2" stroke-linecap="round" :style="{ stroke: color }" />
    </template>
    <text
      v-for="(l, i) in lines"
      :key="i"
      x="50"
      :y="startY + i * fontSize * 1.05"
      text-anchor="middle"
      :font-size="fontSize"
      class="font-display"
      :class="tone"
      >{{ l }}</text
    >
  </g>
</template>
