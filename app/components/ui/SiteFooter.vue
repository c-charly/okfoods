<script setup lang="ts">
/** Pied de page : « Il ne reste que des miettes » — un tas de miettes qu'on disperse (physique desktop, canvas léger mobile). */
const { t } = useUi()
const { links } = useNavLinks()
const lieu = useLieu()
const site = useSite()
const localePath = useLocalePath()
const year = new Date().getFullYear()
const telHref = computed(() =>
  /\d{6,}/.test(lieu.value?.telephone ?? '') ? `tel:${(lieu.value!.telephone as string).replace(/[^\d+]/g, '')}` : null,
)
</script>

<template>
  <footer
    class="on-dark relative overflow-hidden bg-ok-blue pb-[calc(var(--bottom-nav-h)+var(--safe-bottom))] text-ok-white md:pb-0"
  >
    <div class="wrap pt-16 md:pt-24">
      <p class="giant text-[clamp(2.6rem,10.5vw,9rem)] !leading-[0.85]" aria-hidden="false">{{ t('footer.title') }}</p>
      <p class="sub mt-4 text-ok-yellow">{{ t('footer.hint') }}</p>
    </div>
    <div class="relative mt-2 h-[clamp(9rem,26vw,15rem)]"><Crumbs mode="pile" :count="130" /></div>
    <div class="wrap grid gap-10 pb-10 pt-6 md:grid-cols-3">
      <section aria-labelledby="f-coords">
        <h2 id="f-coords" class="font-display mb-3 text-xl">{{ t('footer.coords') }}</h2>
        <address v-if="lieu" class="space-y-1 not-italic">
          <p class="font-bold">{{ lieu.nom }} <PlaceholderBadge :show="lieu.placeholder" /></p>
          <p>{{ lieu.adresse }}</p>
          <p v-if="telHref">
            <a :href="telHref" class="underline">{{ lieu.telephone }}</a>
          </p>
          <p v-else>{{ lieu.telephone }}</p>
          <p>
            <a :href="`mailto:${lieu.email}`" class="underline">{{ lieu.email }}</a>
          </p>
          <p>{{ lieu.horaires }}</p>
        </address>
      </section>
      <nav aria-labelledby="f-links">
        <h2 id="f-links" class="font-display mb-3 text-xl">{{ t('footer.links') }}</h2>
        <ul class="grid grid-cols-2 gap-x-4">
          <li v-for="l in links" :key="l.key">
            <NuxtLink :to="l.path" class="inline-flex min-h-11 items-center underline">{{ l.label }}</NuxtLink>
          </li>
          <li>
            <NuxtLink :to="localePath('/mentions-legales')" class="inline-flex min-h-11 items-center underline">{{
              t('footer.legal')
            }}</NuxtLink>
          </li>
          <li>
            <NuxtLink :to="localePath('/confidentialite')" class="inline-flex min-h-11 items-center underline">{{
              t('footer.privacy')
            }}</NuxtLink>
          </li>
          <li v-for="s in site?.social ?? []" :key="s.name">
            <a
              :href="s.url"
              rel="noopener noreferrer"
              target="_blank"
              class="inline-flex min-h-11 items-center underline"
              >{{ s.name }}</a
            >
          </li>
        </ul>
      </nav>
      <div class="flex flex-col items-start gap-3">
        <LangSwitch />
        <MotionToggle />
      </div>
    </div>
    <p class="wrap pb-8 text-sm opacity-90">© {{ year }} {{ site?.nom }}. {{ t('footer.rights') }}</p>
  </footer>
</template>
