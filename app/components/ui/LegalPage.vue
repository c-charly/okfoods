<script setup lang="ts">
defineProps<{ title: string; paragraphs: string[]; placeholder?: boolean }>()
</script>

<template>
  <article class="bg-ok-cream px-4 py-16 text-ok-blue md:py-24">
    <div class="wrap max-w-3xl">
      <h1 class="text-title">{{ title }}</h1>
      <p class="mt-3"><PlaceholderBadge :show="placeholder" /></p>
      <p v-for="(p, i) in paragraphs" :key="i" class="mt-5 text-[1.1rem]">{{ p }}</p>
    </div>
  </article>
</template>
