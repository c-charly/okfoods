<script setup lang="ts">
/** Icones de l'interface (SVG en traits, 24x24, couleur = currentColor). Taille par defaut 24 px, modifiable via `size`. */
withDefaults(
  defineProps<{
    name:
      | 'home'
      | 'products'
      | 'recipe'
      | 'find'
      | 'more'
      | 'close'
      | 'motion'
      | 'arrow-right'
      | 'arrow-left'
      | 'arrow-down'
      | 'external'
      | 'quote'
      | 'warning'
    size?: string
  }>(),
  { size: 'h-6 w-6' },
)
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    :class="size"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path v-if="name === 'home'" d="M3 11 12 3l9 8M5 9.5V21h5v-6h4v6h5V9.5" />
    <template v-else-if="name === 'products'">
      <circle cx="12" cy="12" r="9" />
      <circle cx="9" cy="10" r="1" />
      <circle cx="14" cy="9" r="1" />
      <circle cx="13" cy="15" r="1" />
    </template>
    <template v-else-if="name === 'recipe'">
      <path d="M3 11h18a9 9 0 0 1-18 0Z" />
      <path d="M9 7c0-2 2-2 2-4M14 7c0-2 2-2 2-4" />
    </template>
    <template v-else-if="name === 'find'">
      <path d="M12 22C6 15 5 12 5 9.5a7 7 0 0 1 14 0C19 12 18 15 12 22Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </template>
    <template v-else-if="name === 'more'">
      <circle cx="5" cy="12" r="1.2" />
      <circle cx="12" cy="12" r="1.2" />
      <circle cx="19" cy="12" r="1.2" />
    </template>
    <path v-else-if="name === 'close'" d="M5 5l14 14M19 5 5 19" />
    <path v-else-if="name === 'arrow-right'" d="M5 12h14M13 6l6 6-6 6" />
    <path v-else-if="name === 'arrow-left'" d="M19 12H5M11 6l-6 6 6 6" />
    <path v-else-if="name === 'arrow-down'" d="M12 5v14M6 13l6 6 6-6" />
    <path v-else-if="name === 'external'" d="M7 17 17 7M9 7h8v8" />
    <path
      v-else-if="name === 'quote'"
      d="M6.5 7h4.500v4.500c0 3-1.500 5-4.500 6l-.6-1.600c1.400-.7 2-1.800 2-3.300H6.500V7ZM14 7h4.500v4.500c0 3-1.500 5-4.500 6l-.6-1.600c1.400-.7 2-1.800 2-3.300H14V7Z"
      fill="currentColor"
      stroke="none"
    />
    <template v-else-if="name === 'warning'">
      <path d="M12 3 2.500 20h19L12 3Z" />
      <path d="M12 10v4M12 17.200v.1" />
    </template>
    <template v-else>
      <circle cx="12" cy="12" r="9" />
      <path d="M10 9v6M14 9v6" />
    </template>
  </svg>
</template>
