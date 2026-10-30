<script setup lang="ts">
import type { ContactFlow } from '~/types/content'

/**
 * Parcours en conversation (bonus, jamais l'unique voie : le formulaire classique est toujours en dessous).
 * Étapes et questions viennent de contact.json. « Candidat » redirige vers /team-bleue.
 */
const props = defineProps<{ flow: ContactFlow; email: string }>()
const emit = defineEmits<{ prefill: [text: string] }>()
const { t } = useUi()
const { mode } = useMotion()

type Profil = ContactFlow['profils'][number]
interface Msg {
  from: 'bot' | 'user'
  text: string
}
const messages = ref<Msg[]>([])
const profil = ref<Profil | null>(null)
const stepIdx = ref(0)
const answers = ref<{ question: string; answer: string }[]>([])
const typing = ref(false)
const done = ref(false)
const draft = ref('')
const log = ref<HTMLElement>()
let started = false

const step = computed(() => profil.value?.steps[stepIdx.value])
const delay = () => (mode.value === 'static' ? 0 : mode.value === 'lite' ? 250 : 550)

function reset() {
  profil.value = null
  stepIdx.value = 0
  answers.value = []
  done.value = false
  typing.value = false
  draft.value = ''
  messages.value = [{ from: 'bot', text: props.flow.intro }]
  started = false
}
reset()

async function say(text: string) {
  typing.value = true
  await new Promise((r) => setTimeout(r, delay()))
  typing.value = false
  messages.value.push({ from: 'bot', text })
  scroll()
}
function scroll() {
  if (!started) return
  nextTick(() =>
    log.value?.lastElementChild?.scrollIntoView({
      block: 'nearest',
      behavior: mode.value === 'static' ? 'auto' : 'smooth',
    }),
  )
}
async function choose(p: Profil) {
  started = true
  profil.value = p
  messages.value.push({ from: 'user', text: p.label })
  if (p.redirect) {
    await say(t('contact.chat.candidate'))
    return
  }
  await ask()
}
async function ask() {
  const s = step.value
  if (!s) {
    await say(props.flow.outro)
    done.value = true
    return
  }
  await say(s.question)
}
async function reply(text: string) {
  const s = step.value
  const value = text.trim()
  if (!s || !value) return
  answers.value.push({ question: s.question, answer: value })
  messages.value.push({ from: 'user', text: value })
  draft.value = ''
  stepIdx.value++
  scroll()
  await ask()
}

const recap = computed(() => answers.value.map((a) => `${a.question}\n→ ${a.answer}`))
const mailto = computed(() =>
  buildMailto(props.email, profil.value?.subject ?? '', [profil.value?.label ?? '', '', ...recap.value]),
)
const toForm = () => emit('prefill', [`[${profil.value?.label}]`, ...recap.value].join('\n'))
</script>

<template>
  <div class="mx-auto w-full max-w-2xl">
    <div ref="log" class="space-y-3" role="log" aria-live="polite" :aria-label="t('contact.chat.bot')">
      <div
        v-for="(m, i) in messages"
        :key="i"
        class="flex"
        :class="m.from === 'user' ? 'justify-end' : 'justify-start'"
      >
        <p
          class="max-w-[85%] px-5 py-3 text-[1.1rem] font-bold"
          :class="
            m.from === 'bot'
              ? 'bg-ok-blue text-ok-white rounded-[1.6rem_1.6rem_1.6rem_0.4rem]'
              : 'bg-ok-yellow text-ok-blue rounded-[1.6rem_1.6rem_0.4rem_1.6rem]'
          "
        >
          <span class="sr-only">{{ m.from === 'bot' ? t('contact.chat.bot') : t('contact.chat.you') }} : </span
          >{{ m.text }}
        </p>
      </div>
      <div v-if="typing" class="flex">
        <p class="rounded-[1.6rem_1.6rem_1.6rem_0.4rem] bg-ok-blue px-5 py-3 text-ok-white" aria-hidden="true">
          <span class="dots">•••</span>
        </p>
      </div>
    </div>

    <div class="mt-5">
      <div v-if="!profil" class="flex flex-wrap gap-2" role="group" :aria-label="t('contact.chat.who')">
        <Btn v-for="p in flow.profils" :key="p.id" variant="blue" @click="choose(p)">{{ p.label }}</Btn>
      </div>

      <div v-else-if="profil.redirect" class="flex flex-wrap gap-2">
        <Btn :to="profil.redirect" variant="red">{{ t('contact.chat.goTeam') }} →</Btn>
        <Btn variant="ghost" @click="reset">{{ t('contact.chat.restart') }}</Btn>
      </div>

      <template v-else-if="!done && step && !typing">
        <div v-if="step.type === 'choice'" class="flex flex-wrap gap-2" role="group" :aria-label="step.question">
          <Btn v-for="o in step.options" :key="o" variant="blue" @click="reply(o)">{{ o }}</Btn>
        </div>
        <form v-else class="flex gap-2" @submit.prevent="reply(draft)">
          <label class="sr-only" for="chat-input">{{ step.question }}</label>
          <input
            id="chat-input"
            v-model="draft"
            class="field"
            type="text"
            :placeholder="t('contact.chat.placeholder')"
            enterkeyhint="send"
            maxlength="600"
            autocomplete="off"
          />
          <Btn type="submit" variant="red">{{ t('contact.chat.send') }}</Btn>
        </form>
      </template>

      <div v-else-if="done" class="mt-2 border-t-4 border-ok-blue pt-4">
        <h3 class="font-display text-2xl">{{ t('contact.chat.recap') }}</h3>
        <dl class="mt-2 space-y-2">
          <div v-for="a in answers" :key="a.question">
            <dt class="text-sm font-bold opacity-80">{{ a.question }}</dt>
            <dd class="text-lg font-bold">{{ a.answer }}</dd>
          </div>
        </dl>
        <div class="mt-4 flex flex-wrap gap-2">
          <Btn :href="mailto" variant="red">{{ t('contact.chat.mailto') }}</Btn>
          <Btn variant="blue" @click="toForm">{{ t('contact.chat.useForm') }}</Btn>
          <Btn variant="ghost" @click="reset">{{ t('contact.chat.restart') }}</Btn>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dots {
  display: inline-block;
  animation: ok-pulse 0.9s ease-in-out infinite;
  letter-spacing: 0.15em;
}
</style>
