<script setup lang="ts">
/**
 * Placeholder aux couleurs de la marque (SVG). Le nom du fichier attendu n'apparaît QUE si
 * NUXT_PUBLIC_SHOW_PLACEHOLDERS=true ; sinon le rendu reste joli, sans libellé technique.
 */
const props = withDefaults(
  defineProps<{
    label?: string
    alt?: string
    tint?: string
    initials?: string
    variant?: 'person' | 'scene' | 'product'
  }>(),
  { variant: 'scene' },
)
const { showLabels } = useImages()
const tone = computed(() => (props.tint ? toneOn(props.tint) : 'light'))
</script>

<template>
  <div
    class="relative h-full min-h-full w-full overflow-hidden"
    :style="{ background: tint || 'var(--ok-blue)' }"
    role="img"
    :aria-label="alt || initials || 'Image'"
  >
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      class="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <circle cx="86" cy="12" r="24" class="f-yellow" opacity="0.9" />
      <circle cx="8" cy="96" r="30" class="f-red" opacity="0.85" />
      <template v-if="variant === 'person'">
        <path d="M10 100 C10 72 30 64 50 64 C70 64 90 72 90 100 Z" class="f-cream" />
        <circle cx="50" cy="40" r="19" class="f-cream" />
        <circle cx="50" cy="42" r="3.2" class="f-ink" />
        <circle cx="42" cy="36" r="1.8" class="f-ink" />
        <circle cx="58" cy="36" r="1.8" class="f-ink" />
        <circle cx="68" cy="56" r="11" class="f-yellow" />
        <circle cx="75" cy="50" r="5" :style="{ fill: tint || 'var(--ok-blue)' }" />
        <text x="50" y="90" text-anchor="middle" font-size="13" class="font-display f-blue">{{ initials }}</text>
      </template>
      <template v-else>
        <ellipse cx="50" cy="56" rx="30" ry="26" class="f-cream" opacity="0.18" />
        <path
          d="M50 78 L50 38 M50 52 Q38 46 36 36 M50 52 Q62 46 64 36 M50 64 Q38 58 36 48 M50 64 Q62 58 64 48"
          fill="none"
          stroke-width="2.4"
          stroke-linecap="round"
          class="s-cream"
          opacity="0.5"
        />
      </template>
    </svg>
    <span
      v-if="variant !== 'person' && initials"
      class="font-display absolute inset-0 grid place-items-center text-[clamp(2rem,10vw,5rem)]"
      :style="{ color: tone === 'light' ? 'var(--ok-white)' : 'var(--ok-ink)' }"
      >{{ initials }}</span
    >
    <span
      v-if="showLabels && label"
      class="absolute bottom-2 left-2 max-w-[90%] truncate rounded bg-ok-ink px-2 py-0.5 text-[11px] font-bold text-ok-white"
      >{{ label }}</span
    >
  </div>
</template>
