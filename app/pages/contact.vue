<script setup lang="ts">
import type { ContactFlow } from '~/types/content'

/** Contact : distributeurs, partenaires, presse. Aucune commande en ligne. */
const { locale } = useI18n()
const { t } = useUi()
const lieu = useLieu()
const site = useSite()
const { data: flow } = await useAsyncData('contact-flow', () => loadOne<ContactFlow>('contact', locale.value), {
  watch: [locale],
})
const message = ref('')
const formEl = ref<HTMLElement>()
const email = computed(() => site.value?.emailContact || lieu.value?.email || '')
useSeo('contact')

function prefill(text: string) {
  message.value = text
  nextTick(() => {
    formEl.value?.scrollIntoView({ block: 'start', behavior: 'smooth' })
    formEl.value?.querySelector<HTMLElement>('input, textarea')?.focus({ preventScroll: true })
  })
}
</script>

<template>
  <div>
    <header class="on-dark relative overflow-hidden bg-ok-blue px-4 pb-16 pt-12 text-ok-white md:pt-20">
      <div class="wrap">
        <p class="sub text-ok-yellow">{{ t('contact.kicker') }}</p>
        <h1 class="giant mt-1 text-[clamp(3.4rem,13vw,11rem)]">{{ t('contact.title') }}</h1>
        <p class="mt-4 max-w-[44ch] text-[1.2rem] font-bold">{{ t('contact.intro') }}</p>
        <p class="mt-2 max-w-[44ch]">{{ t('contact.noOrder') }}</p>
      </div>
    </header>

    <section class="bg-ok-cream px-4 py-14 text-ok-blue md:py-20" aria-label="Conversation">
      <ContactChat v-if="flow" :flow="flow" :email="email" @prefill="prefill" />
    </section>

    <section
      id="formulaire"
      ref="formEl"
      class="scroll-mt-20 bg-ok-yellow px-4 py-14 text-ok-blue md:py-20"
      aria-labelledby="form-title"
    >
      <div class="wrap">
        <h2 id="form-title" class="text-title mb-8 text-center">{{ t('contact.form.title') }}</h2>
        <ContactForm v-model:message="message" />
        <p class="mx-auto mt-6 max-w-2xl text-center">
          <a :href="`mailto:${email}`" class="font-bold underline">{{ email }}</a>
        </p>
      </div>
    </section>
  </div>
</template>
