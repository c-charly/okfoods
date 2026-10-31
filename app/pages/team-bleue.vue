<script setup lang="ts">
import type { Poste } from '~/types/content'

/** Recrutement. Aucune donnée personnelle n'est collectée : le badge et le message WhatsApp sont générés sur l'appareil. */
const { locale } = useI18n()
const { t, raw } = useUi()
const site = useSite()
const config = useRuntimeConfig()
const base = String(config.public.siteUrl || '').replace(/\/$/, '')
const { data: postes } = await useAsyncData('postes', () => loadBody<Poste>('postes', locale.value), {
  watch: [locale],
  default: () => [],
})
const now = useState('now', () => Date.now())
onMounted(() => {
  now.value = Date.now()
})
const closed = (p: Poste) => !isJobOpen(p, now.value)
const steps = computed<{ title: string; text: string }[]>(() => raw('team.apply') ?? [])
useSeo('team')

// JobPosting : uniquement pour les postes OUVERTS et réels (jamais pour un contenu d'exemple)
useJsonLd(() => {
  const jobs = postes.value.filter((p) => !p.placeholder && isJobOpen(p, now.value))
  if (!jobs.length) return null
  return jobs.map((p) => ({
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: p.intitule,
    description: p.profil,
    ...(p.datePublication ? { datePosted: p.datePublication } : {}),
    validThrough: p.dateLimite,
    hiringOrganization: { '@type': 'Organization', name: site.value?.nom, sameAs: base },
    jobLocation: {
      '@type': 'Place',
      address: { '@type': 'PostalAddress', addressLocality: p.ville, addressCountry: 'CM' },
    },
  }))
})
</script>

<template>
  <div>
    <header class="on-dark relative overflow-hidden bg-ok-blue px-4 pb-20 pt-12 text-ok-white md:pb-28 md:pt-20">
      <div class="wrap grid items-center gap-8 md:grid-cols-[1.5fr_1fr]">
        <div>
          <p class="sub text-ok-yellow">{{ t('team.kicker') }}</p>
          <h1 class="giant mt-1 text-[clamp(3.6rem,14vw,12rem)]">{{ t('team.title') }}</h1>
          <p class="mt-5 max-w-[34ch] text-[1.25rem] font-bold">{{ t('team.hook') }}</p>
          <div class="mt-6">
            <Btn href="#postes" variant="yellow">{{ t('team.jobs') }} <UiIcon name="arrow-down" size="h-5 w-5" /></Btn>
          </div>
        </div>
        <div class="relative mx-auto w-[min(72vw,22rem)] md:w-full" aria-hidden="true">
          <div class="blob-a bg-ok-yellow p-8"><Uniform class="w-full" /></div>
          <Tricycle moving class="absolute -bottom-8 -left-4 w-3/5 drop-shadow-[0_6px_0_var(--ok-blue-deep)]" />
        </div>
      </div>
    </header>

    <!-- Bandeau anti-arnaque, bien visible dès l'arrivée -->
    <aside class="on-dark bg-ok-red-deep px-4 py-4 text-ok-white" role="note">
      <p class="wrap flex items-center gap-3 text-[1.1rem] font-bold">
        <span
          class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ok-yellow text-xl text-ok-red-deep"
          aria-hidden="true"
          >!</span
        >{{ t('team.scam') }}
      </p>
    </aside>

    <section id="postes" class="scroll-mt-20 bg-ok-cream px-4 py-16 text-ok-blue md:py-24" aria-labelledby="jobs-title">
      <div class="wrap">
        <h2 id="jobs-title" class="text-title">{{ t('team.jobs') }}</h2>
        <ul v-if="postes.length" class="mt-8 border-t-4 border-ok-blue">
          <li
            v-for="p in postes"
            :key="p.id"
            class="grid gap-1 border-b-4 border-ok-blue py-5 md:grid-cols-[2fr_1fr_2fr_1.3fr_auto] md:items-center md:gap-6"
            :class="closed(p) ? 'text-ok-ink/70' : ''"
            :aria-disabled="closed(p) || undefined"
          >
            <h3
              class="font-display flex flex-wrap items-center gap-2 text-2xl"
              :class="closed(p) ? 'line-through decoration-2' : ''"
            >
              {{ p.intitule }} <PlaceholderBadge :show="p.placeholder" />
            </h3>
            <p>
              <span class="font-bold md:sr-only">{{ t('team.city') }} : </span>{{ p.ville }}
            </p>
            <p>
              <span class="font-bold md:sr-only">{{ t('team.profile') }} : </span>{{ p.profil }}
            </p>
            <p>
              <span class="font-bold md:sr-only">{{ t('team.deadline') }} : </span
              ><time :datetime="p.dateLimite">{{ formatDate(p.dateLimite, locale) }}</time>
            </p>
            <p>
              <span
                class="inline-block rounded-full px-4 py-1 text-base font-bold"
                :class="closed(p) ? 'border-2 border-current' : 'bg-ok-blue text-ok-white'"
                >{{ closed(p) ? t('team.closed') : t('team.open') }}</span
              >
            </p>
          </li>
        </ul>
        <p v-else class="sub mt-6">{{ t('team.noJobs') }}</p>
      </div>
    </section>

    <section class="bg-ok-yellow px-4 py-16 text-ok-blue md:py-24" aria-labelledby="apply-title">
      <div class="wrap">
        <h2 id="apply-title" class="text-title">{{ t('team.applyTitle') }}</h2>
        <ol class="mt-8 grid gap-8 md:grid-cols-3">
          <li v-for="(s, i) in steps" :key="i" class="flex gap-4">
            <span class="giant text-[clamp(4rem,9vw,6rem)] !leading-[0.8] text-ok-red-deep">{{ i + 1 }}</span>
            <div>
              <h3 class="text-2xl">{{ s.title }}</h3>
              <p class="mt-1 text-[1.1rem] font-bold">{{ s.text }}</p>
            </div>
          </li>
        </ol>
      </div>
    </section>

    <section class="bg-ok-cream px-4 py-16 text-ok-blue md:py-24" aria-labelledby="badge-title">
      <div class="wrap">
        <h2 id="badge-title" class="text-title mb-8">{{ t('team.badge.title') }}</h2>
        <BadgeGenerator :postes="postes" :now="now" />
      </div>
    </section>
  </div>
</template>
