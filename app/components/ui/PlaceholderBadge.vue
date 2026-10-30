<script setup lang="ts">
/** Marque visible les contenus d'exemple (`placeholder: true`). Disparaît dès que la donnée passe à `false`. */
defineProps<{ show?: boolean }>()
const { t } = useUi()
</script>

<template>
  <span
    v-if="show"
    class="inline-block rounded-full bg-ok-yellow px-3 py-1 text-xs font-bold leading-none text-ok-blue"
    >{{ t('placeholder.badge') }}</span
  >
</template>
