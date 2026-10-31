<script setup lang="ts">
/** " La Tournée " : périmètre limité à Douala et Bonabéri. Pas de carte nationale, pas de " Trouve ton vendeur ". */
const { t } = useUi()
const lieu = useLieu()
const showMap = ref(false)
const telHref = computed(() =>
  /\d{6,}/.test(lieu.value?.telephone ?? '') ? `tel:${(lieu.value!.telephone as string).replace(/[^\d+]/g, '')}` : null,
)
useSeo('find')

// LocalBusiness : les champs encore " à renseigner " ne sont pas publiés comme des faits.
useJsonLd(() => {
  const l = lieu.value
  if (!l) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: l.nom,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Bonabéri, Douala',
      addressCountry: 'CM',
      ...(l.placeholder ? {} : { streetAddress: l.adresse }),
    },
    ...(l.placeholder ? {} : { telephone: l.telephone, email: l.email, openingHours: l.horaires }),
    ...(l.gps ? { geo: { '@type': 'GeoCoordinates', latitude: l.gps.lat, longitude: l.gps.lng } } : {}),
    hasMap: l.mapsUrl,
  }
})
</script>

<template>
  <div>
    <section class="tour-section on-dark relative bg-ok-blue text-ok-white" data-tour>
      <div class="tour-stick flex items-center px-4 py-10 md:py-8">
        <div class="wrap grid w-full items-center gap-8 md:grid-cols-[1fr_1.35fr] md:gap-12">
          <div>
            <p class="sub text-ok-yellow">{{ t('trouver.kicker') }}</p>
            <h1 class="text-title mt-1 !text-[clamp(2.6rem,7vw,5.5rem)]">{{ t('trouver.title') }}</h1>
            <p class="mt-3 max-w-[36ch] text-[1.15rem] font-bold">{{ t('trouver.intro') }}</p>

            <!-- Bloc d'informations : toujours visible, en haut de la section sur mobile -->
            <section v-if="lieu" class="mt-6 border-t-4 border-ok-yellow pt-4" aria-labelledby="infos-title">
              <h2 id="infos-title" class="font-display flex flex-wrap items-center gap-2 text-2xl">
                {{ lieu.nom }} <PlaceholderBadge :show="lieu.placeholder" />
              </h2>
              <p class="mt-1 text-[1.05rem]">{{ lieu.nature }}</p>
              <dl class="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[1.05rem]">
                <dt class="font-bold text-ok-yellow">{{ t('trouver.address') }}</dt>
                <dd>{{ lieu.adresse }}</dd>
                <dt class="font-bold text-ok-yellow">{{ t('trouver.phone') }}</dt>
                <dd>
                  <a v-if="telHref" :href="telHref" class="underline">{{ lieu.telephone }}</a
                  ><span v-else>{{ lieu.telephone }}</span>
                </dd>
                <dt class="font-bold text-ok-yellow">{{ t('trouver.email') }}</dt>
                <dd>
                  <a :href="`mailto:${lieu.email}`" class="underline">{{ lieu.email }}</a>
                </dd>
                <dt class="font-bold text-ok-yellow">{{ t('trouver.hours') }}</dt>
                <dd>{{ lieu.horaires }}</dd>
              </dl>
              <div class="mt-5 flex flex-wrap gap-3">
                <Btn :href="lieu.mapsUrl" external variant="yellow"
                  >{{ t('trouver.route') }} <UiIcon name="external" size="h-5 w-5"
                /></Btn>
                <Btn v-if="lieu.mapsEmbedUrl" variant="ghost" :aria-expanded="showMap" @click="showMap = !showMap">{{
                  showMap ? t('trouver.mapHide') : t('trouver.map')
                }}</Btn>
              </div>
              <!-- Carte chargée UNIQUEMENT au clic (aucune carte embarquée par défaut) -->
              <iframe
                v-if="showMap && lieu.mapsEmbedUrl"
                :src="lieu.mapsEmbedUrl"
                :title="lieu.nom"
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                class="mt-4 aspect-video w-full rounded-2xl border-0"
              />
            </section>
          </div>
          <TourneeScene />
        </div>
      </div>
    </section>
  </div>
</template>

<style>
.tour-stick {
  min-height: calc(100svh - 3.5rem);
}
@media (hover: hover) and (pointer: fine) and (min-width: 1024px) {
  html[data-layout='tall'] .tour-section {
    height: 260svh;
  }
  html[data-layout='tall'] .tour-stick {
    position: sticky;
    top: 3.5rem;
    height: calc(100svh - 3.5rem);
    overflow: hidden;
  }
}
@media (max-width: 1023px) {
  .tour-stick {
    min-height: calc(100svh - 3.5rem - var(--bottom-nav-h));
  }
}
</style>
