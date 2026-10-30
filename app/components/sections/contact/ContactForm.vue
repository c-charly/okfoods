<script setup lang="ts">
/** Formulaire classique (toujours accessible). Anti-spam : champ piège + délai minimum + limite de débit côté serveur. */
const model = defineModel<string>('message', { default: '' })
const { t } = useUi()
const form = reactive({ name: '', email: '', phone: '', website: '' })
const status = ref<'idle' | 'sending' | 'ok' | 'demo' | 'error' | 'rate'>('idle')
const ts = ref(0)
onMounted(() => {
  ts.value = Date.now()
})

async function submit() {
  if (status.value === 'sending') return
  status.value = 'sending'
  try {
    const res = await $fetch<{ ok: boolean; demo?: boolean }>('/api/contact', {
      method: 'POST',
      body: { ...form, message: model.value, ts: ts.value },
    })
    status.value = res.demo ? 'demo' : 'ok'
    if (res.ok) {
      form.name = form.email = form.phone = ''
      model.value = ''
      ts.value = Date.now()
    }
  } catch (e: any) {
    status.value = e?.statusCode === 429 ? 'rate' : 'error'
  }
}
</script>

<template>
  <form class="mx-auto max-w-2xl space-y-4" @submit.prevent="submit">
    <div class="grid gap-4 sm:grid-cols-2">
      <div>
        <label class="field-label" for="c-name">{{ t('contact.form.name') }}</label
        ><input
          id="c-name"
          v-model="form.name"
          class="field"
          type="text"
          autocomplete="name"
          enterkeyhint="next"
          required
          minlength="2"
          maxlength="120"
        />
      </div>
      <div>
        <label class="field-label" for="c-email">{{ t('contact.form.email') }}</label
        ><input
          id="c-email"
          v-model="form.email"
          class="field"
          type="email"
          inputmode="email"
          autocomplete="email"
          enterkeyhint="next"
          required
          maxlength="200"
        />
      </div>
    </div>
    <div>
      <label class="field-label" for="c-phone">{{ t('contact.form.phone') }}</label
      ><input
        id="c-phone"
        v-model="form.phone"
        class="field"
        type="tel"
        inputmode="tel"
        autocomplete="tel"
        enterkeyhint="next"
        maxlength="40"
      />
    </div>
    <div>
      <label class="field-label" for="c-message">{{ t('contact.form.message') }}</label
      ><textarea
        id="c-message"
        v-model="model"
        class="field"
        required
        minlength="5"
        maxlength="4000"
        enterkeyhint="enter"
      />
    </div>
    <!-- Champ piège : invisible et hors parcours clavier -->
    <div class="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
      <label>Website<input v-model="form.website" type="text" tabindex="-1" autocomplete="off" /></label>
    </div>
    <Btn type="submit" variant="red" :disabled="status === 'sending'">{{
      status === 'sending' ? t('contact.form.sending') : t('contact.form.send')
    }}</Btn>
    <p
      v-if="status !== 'idle' && status !== 'sending'"
      class="rounded-xl p-3 font-bold"
      :class="status === 'ok' || status === 'demo' ? 'bg-ok-yellow text-ok-blue' : 'bg-ok-red-deep text-ok-white'"
      role="status"
    >
      {{
        status === 'ok'
          ? t('contact.form.success')
          : status === 'demo'
            ? `${t('contact.form.success')} ${t('contact.form.demo')}`
            : status === 'rate'
              ? t('contact.form.rate')
              : t('contact.form.error')
      }}
    </p>
  </form>
</template>
