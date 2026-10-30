<script setup lang="ts">
/** Logo OK Foods tel quel (jamais déformé). Si le fichier réel n'est pas encore fourni : wordmark de repli. */
const props = withDefaults(defineProps<{ variant?: 'color' | 'white' }>(), { variant: 'color' })
const { resolve } = useImages()
const file = computed(() =>
  resolve(props.variant === 'white' ? '/images/brand/logo-blanc.svg' : '/images/brand/logo.svg'),
)
</script>

<template>
  <img v-if="file" :src="file" alt="OK Foods" width="150" height="48" class="h-full w-auto" />
  <svg v-else viewBox="0 0 150 48" role="img" aria-label="OK Foods" class="h-full w-auto">
    <circle cx="24" cy="24" r="22" :class="variant === 'white' ? 'f-yellow' : 'f-red'" />
    <text
      x="24"
      y="33"
      text-anchor="middle"
      font-size="23"
      class="font-display"
      :class="variant === 'white' ? 'f-blue' : 'f-white'"
    >
      OK
    </text>
    <text x="53" y="35" font-size="27" class="font-display" :class="variant === 'white' ? 'f-white' : 'f-blue'">
      Foods
    </text>
  </svg>
</template>
