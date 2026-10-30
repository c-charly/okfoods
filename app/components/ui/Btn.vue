<script setup lang="ts">
/** Bouton / lien. Texte ≥ 19 px en gras (« grand texte » WCAG), zone tactile ≥ 44×44 px. */
const props = withDefaults(
  defineProps<{
    to?: string
    href?: string
    variant?: 'red' | 'yellow' | 'blue' | 'cream' | 'ghost'
    type?: 'button' | 'submit'
    external?: boolean
    disabled?: boolean
  }>(),
  { variant: 'red', type: 'button' },
)
const localePath = useLocalePath()
const base =
  'inline-flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-full px-6 py-3 text-[1.2rem] font-bold leading-none no-underline transition-transform duration-200 ease-out-soft hover:-translate-y-0.5 active:scale-95 aria-disabled:pointer-events-none aria-disabled:opacity-50 disabled:pointer-events-none disabled:opacity-50'
const look = computed(
  () =>
    ({
      red: 'bg-ok-red text-ok-white',
      yellow: 'bg-ok-yellow text-ok-blue',
      blue: 'bg-ok-blue text-ok-white',
      cream: 'bg-ok-cream text-ok-blue',
      ghost: 'border-2 border-current bg-transparent',
    })[props.variant],
)
</script>

<template>
  <NuxtLink v-if="to" :to="localePath(to)" :class="[base, look]"><slot /></NuxtLink>
  <a
    v-else-if="href"
    :href="href"
    :class="[base, look]"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener noreferrer' : undefined"
    :aria-disabled="disabled || undefined"
    ><slot
  /></a>
  <button v-else :type="type" :disabled="disabled" :class="[base, look]"><slot /></button>
</template>
