<script setup lang="ts">
const site = useSite()
const doc = computed(() => site.value?.legal?.mentions)
useSeo('legal')
</script>

<template>
  <LegalPage v-if="doc" :title="doc.title" :paragraphs="doc.paragraphs" :placeholder="site?.placeholder" />
</template>
