<script setup lang="ts">
await useGlobalContent()
const site = useSite()
const config = useRuntimeConfig()
const base = String(config.public.siteUrl || '').replace(/\/$/, '')
const name = computed(() => site.value?.nom ?? 'OK Foods Cameroun')

useHead({ titleTemplate: (t) => (t ? `${t} · ${name.value}` : name.value) })
useJsonLd(() => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: name.value,
  url: base,
  logo: `${base}/favicon.svg`,
  ...(site.value?.social?.length ? { sameAs: site.value.social.map((s: { url: string }) => s.url) } : {}),
}))
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout><NuxtPage /></NuxtLayout>
  <PageBite />
</template>
