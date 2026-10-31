<script setup lang="ts">
/** " Réduire les animations " : accessible en permanence (pied de page + menu). Choix mémorisé. */
defineProps<{ variant?: 'text' | 'icon' }>()
const { userReduced, toggleReduced } = useMotion()
const { t } = useUi()
// Le choix mémorisé n'est connu que côté client : on ne l'affiche qu'après l'hydratation (rendu identique au serveur).
const ready = ref(false)
onMounted(() => {
  ready.value = true
})
const pressed = computed(() => ready.value && userReduced.value)
const label = computed(() => (pressed.value ? t('motion.restore') : t('motion.reduce')))
</script>

<template>
  <button
    type="button"
    class="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-current px-4 text-base font-bold leading-none"
    :class="variant === 'icon' ? 'min-w-11 justify-center !px-0' : ''"
    :aria-pressed="pressed"
    :title="label"
    @click="toggleReduced"
  >
    <UiIcon name="motion" />
    <span :class="variant === 'icon' ? 'sr-only' : ''">{{ label }}</span>
  </button>
</template>
