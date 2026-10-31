<script setup lang="ts">
/** Barre de navigation basse (mobile, zone du pouce) : Accueil, Produits, Recette, Nous trouver, Plus. */
const { t } = useUi()
const { links } = useNavLinks()
const open = useState('more-open', () => false)
const items = computed(() => {
  const by = Object.fromEntries(links.value.map((l) => [l.key, l]))
  return [
    { ...by.home!, icon: 'home' as const },
    { ...by.products!, icon: 'products' as const },
    { ...by.recipe!, icon: 'recipe' as const },
    { ...by.find!, icon: 'find' as const },
  ]
})
</script>

<template>
  <nav
    class="on-dark fixed inset-x-0 bottom-0 z-50 bg-ok-blue text-ok-white lg:hidden"
    :aria-label="t('a11y.mobileNav')"
    style="padding-bottom: var(--safe-bottom)"
  >
    <ul class="grid h-[var(--bottom-nav-h)] grid-cols-5">
      <li v-for="i in items" :key="i.key">
        <NuxtLink
          :to="i.path"
          :aria-current="i.active ? 'page' : undefined"
          class="flex h-full min-w-11 flex-col items-center justify-center gap-0.5 text-[0.78rem] font-bold leading-none no-underline"
          :class="i.active ? 'text-ok-yellow' : 'text-ok-white'"
        >
          <UiIcon :name="i.icon" />{{ i.key === 'find' ? t('nav.findShort') : i.label }}
        </NuxtLink>
      </li>
      <li>
        <button
          type="button"
          class="flex h-full w-full min-w-11 flex-col items-center justify-center gap-0.5 text-[0.78rem] font-bold"
          :aria-expanded="open"
          aria-haspopup="dialog"
          @click="open = true"
        >
          <UiIcon name="more" />{{ t('nav.more') }}
        </button>
      </li>
    </ul>
  </nav>
</template>
