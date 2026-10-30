<script setup lang="ts">
/** Menu plein écran (mobile) : liens secondaires, langue, « Réduire les animations ». <dialog> natif = focus géré. */
const { t } = useUi()
const { links } = useNavLinks()
const localePath = useLocalePath()
const open = useState('more-open', () => false)
const dlg = ref<HTMLDialogElement>()
const secondary = computed(() => links.value.filter((l) => ['team', 'words', 'contact'].includes(l.key)))
watch(open, (v) => {
  const d = dlg.value
  if (!d) return
  if (v && !d.open) d.showModal()
  if (!v && d.open) d.close()
})
watch(
  () => useRoute().fullPath,
  () => (open.value = false),
)
</script>

<template>
  <dialog
    ref="dlg"
    class="on-dark m-0 h-full max-h-none w-full max-w-none border-0 bg-ok-blue p-0 text-ok-white md:hidden"
    :aria-label="t('nav.moreTitle')"
    @close="open = false"
  >
    <div class="flex min-h-full flex-col px-6 pb-10 pt-4">
      <div class="flex items-center justify-between">
        <span class="font-display text-2xl">{{ t('nav.moreTitle') }}</span>
        <button
          type="button"
          class="grid h-12 w-12 place-items-center rounded-full border-2 border-current"
          :aria-label="t('a11y.closeMenu')"
          @click="open = false"
        >
          <NavIcon name="close" />
        </button>
      </div>
      <ul class="mt-8 flex flex-1 flex-col justify-center gap-2">
        <li v-for="l in secondary" :key="l.key">
          <NuxtLink
            :to="l.path"
            class="font-display block py-2 text-[clamp(2.4rem,13vw,4rem)] leading-none no-underline"
            :class="l.active ? 'text-ok-yellow' : 'text-ok-white'"
            >{{ l.label }}</NuxtLink
          >
        </li>
        <li class="pt-4">
          <Btn to="/contact" variant="red">{{ t('nav.partner') }}</Btn>
        </li>
      </ul>
      <div class="mt-8 flex flex-wrap items-center gap-3">
        <LangSwitch />
        <MotionToggle />
      </div>
      <p class="mt-6 flex gap-4 text-sm">
        <NuxtLink :to="localePath('/mentions-legales')" class="underline">{{ t('footer.legal') }}</NuxtLink>
        <NuxtLink :to="localePath('/confidentialite')" class="underline">{{ t('footer.privacy') }}</NuxtLink>
      </p>
    </div>
  </dialog>
</template>
