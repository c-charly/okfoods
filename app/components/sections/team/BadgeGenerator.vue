<script setup lang="ts">
import type { Poste } from '~/types/content'

/**
 * Générateur de badge candidat. Tout se passe sur l'appareil (canvas) : aucune donnée n'est envoyée ni stockée.
 * Si le canvas échoue, le formulaire et le bouton WhatsApp restent utilisables.
 */
const props = defineProps<{ postes: Poste[]; now: number }>()
const { t } = useUi()
const site = useSite()
const images = useImages()

const form = reactive({ prenom: '', ville: '', quartier: '', poste: '' })
const openJobs = computed(() => props.postes.filter((p) => isJobOpen(p, props.now)))
const canvas = ref<HTMLCanvasElement>()
const failed = ref(false)
const ready = ref(false)
let logo: HTMLImageElement | null = null
let raf = 0

async function redraw() {
  const el = canvas.value
  if (!el) return
  try {
    await Promise.all([
      document.fonts.load('100px "Bagel Fat One"'),
      document.fonts.load('700 50px "DM Sans Variable"'),
    ])
    const display = `'Bagel Fat One', 'Arial Rounded MT Bold', system-ui, sans-serif`
    const sans = `'DM Sans Variable', system-ui, sans-serif`
    await drawBadge(
      el,
      {
        prenom: form.prenom,
        poste: form.poste,
        ville: form.ville,
        quartier: form.quartier,
        label: t('team.badge.candidate'),
      },
      {
        blue: cssVar('--ok-blue'),
        blueDeep: cssVar('--ok-blue-deep'),
        red: cssVar('--ok-red'),
        yellow: cssVar('--ok-yellow'),
        cream: cssVar('--ok-cream'),
        white: cssVar('--ok-white'),
        display,
        sans,
      },
      logo,
    )
    ready.value = true
    failed.value = false
  } catch {
    failed.value = true
  }
}
const schedule = () => {
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(redraw)
}
watch(form, schedule, { deep: true })

onMounted(() => {
  const file = images.resolve('/images/brand/logo-blanc.svg')
  if (file) {
    const img = new Image()
    img.onload = () => {
      logo = img
      schedule()
    }
    img.src = file
  }
  schedule()
})
onBeforeUnmount(() => cancelAnimationFrame(raf))

const valid = computed(() => form.prenom.trim().length > 0 && form.poste.trim().length > 0)
const waLink = computed(() =>
  buildWhatsAppLink(
    site.value?.whatsappRecrutement,
    buildApplyMessage(t('team.badge.message'), {
      prenom: form.prenom.trim(),
      poste: form.poste.trim(),
      ville: form.ville.trim(),
      quartier: form.quartier.trim(),
    }),
  ),
)
const noNumber = computed(() => !(site.value?.whatsappRecrutement ?? '').replace(/\D/g, ''))

function download() {
  const el = canvas.value
  if (!el || failed.value) return
  el.toBlob((blob) => {
    if (!blob) return
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `badge-${
      form.prenom
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') || 'candidat'
    }.png`
    a.click()
    window.setTimeout(() => URL.revokeObjectURL(a.href), 2000)
  }, 'image/png')
}
</script>

<template>
  <div class="grid items-start gap-10 md:grid-cols-2 md:gap-14">
    <form class="space-y-4" novalidate @submit.prevent>
      <div>
        <label class="field-label" for="b-prenom">{{ t('team.badge.firstName') }}</label>
        <input
          id="b-prenom"
          v-model="form.prenom"
          class="field"
          type="text"
          autocomplete="given-name"
          enterkeyhint="next"
          maxlength="24"
          required
        />
      </div>
      <div>
        <label class="field-label" for="b-poste">{{ t('team.badge.job') }}</label>
        <select v-if="openJobs.length" id="b-poste" v-model="form.poste" class="field" required>
          <option value="" disabled>{{ t('team.badge.pickJob') }}</option>
          <option v-for="p in openJobs" :key="p.id" :value="p.intitule">{{ p.intitule }} - {{ p.ville }}</option>
        </select>
        <input
          v-else
          id="b-poste"
          v-model="form.poste"
          class="field"
          type="text"
          enterkeyhint="next"
          maxlength="60"
          required
        />
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label class="field-label" for="b-ville">{{ t('team.badge.city') }}</label>
          <input
            id="b-ville"
            v-model="form.ville"
            class="field"
            type="text"
            autocomplete="address-level2"
            enterkeyhint="next"
            maxlength="40"
          />
        </div>
        <div>
          <label class="field-label" for="b-quartier">{{ t('team.badge.district') }}</label>
          <input
            id="b-quartier"
            v-model="form.quartier"
            class="field"
            type="text"
            autocomplete="off"
            enterkeyhint="done"
            maxlength="40"
          />
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-3 pt-2">
        <Btn :href="waLink" external variant="red" :disabled="!valid">{{ t('team.badge.whatsapp') }}</Btn>
        <Btn v-if="!failed" variant="blue" :disabled="!valid" @click="download">{{ t('team.badge.download') }}</Btn>
      </div>
      <p v-if="noNumber" class="flex items-start gap-2 text-sm font-bold">
        <UiIcon name="warning" size="h-5 w-5 shrink-0" />{{ t('team.badge.missingNumber') }}
      </p>
      <p class="text-sm">{{ t('team.badge.note') }}</p>
      <p v-if="failed" class="rounded-xl bg-ok-yellow p-3 font-bold text-ok-blue" role="status">
        {{ t('team.badge.error') }}
      </p>
    </form>

    <div class="mx-auto w-full max-w-[26rem]">
      <p class="font-display mb-2 text-xl">{{ t('team.badge.preview') }}</p>
      <canvas
        v-show="!failed"
        ref="canvas"
        width="1080"
        height="1350"
        class="h-auto w-full rounded-3xl shadow-[0_18px_0_-8px_color-mix(in_srgb,var(--ok-ink)_30%,transparent)]"
        role="img"
        :aria-label="t('team.badge.preview')"
      />
      <p v-if="!valid && !failed" class="mt-3 text-sm">{{ t('team.badge.fillIn') }}</p>
    </div>
  </div>
</template>
