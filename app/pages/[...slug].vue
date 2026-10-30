<script setup lang="ts">
/** 404 : « Il n'en reste que des miettes » — un biscuit déjà croqué. */
const { t } = useUi()
if (import.meta.server) setResponseStatus(useRequestEvent()!, 404)
useSeo('notFound', { noindex: true })
const product = {
  name: 'OK',
  image: undefined,
  color: '#2C3691',
  accentColor: '#F8EF22',
  kind: 'biscuit' as const,
  slug: 'ok',
  range: '',
  envies: ['croquant' as const],
  crumbColor: '#C98A3B',
  format: '',
  flavors: [],
  description: '',
  tagline: '',
  order: 0,
  placeholder: false,
}
const bite = ref<{ bite: () => void; done: boolean } | null>(null)
onMounted(() => {
  window.setTimeout(() => {
    bite.value?.bite()
    window.setTimeout(() => bite.value?.bite(), 350)
    window.setTimeout(() => bite.value?.bite(), 700)
  }, 500)
})
</script>

<template>
  <section class="flex min-h-[calc(100svh-3.5rem)] items-center bg-ok-cream px-4 py-16 text-ok-blue">
    <div class="wrap grid items-center gap-8 md:grid-cols-2">
      <div class="mx-auto aspect-square w-[min(70vw,24rem)]"><BiteMask ref="bite" :product="product" /></div>
      <div>
        <p class="giant text-[clamp(5rem,20vw,14rem)] !leading-[0.8] text-ok-red-deep">404</p>
        <h1 class="text-title mt-4">{{ t('notFound.title') }}</h1>
        <p class="mt-3 text-[1.2rem] font-bold">{{ t('notFound.text') }}</p>
        <div class="mt-6">
          <Btn to="/" variant="blue">{{ t('notFound.home') }}</Btn>
        </div>
      </div>
    </div>
  </section>
</template>
