<script setup lang="ts">
defineProps<{ name: 'home' | 'products' | 'recipe' | 'find' | 'more' | 'close' | 'motion' }>()
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    class="h-6 w-6"
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
    <template v-else>
      <circle cx="12" cy="12" r="9" />
      <path d="M10 9v6M14 9v6" />
    </template>
  </svg>
</template>
