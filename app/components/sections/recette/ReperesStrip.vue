<script setup lang="ts">
/** Bande de repères : 3 à 5 dates ou chiffres ; les valeurs purement numériques s'animent (compteur). */
const props = defineProps<{ items: { valeur: string; label: string; placeholder?: boolean }[] }>()
const { t } = useUi()
const { mode, isStatic } = useMotion()
const root = ref<HTMLElement>()
let ctx: { revert: () => void } | null = null

onMounted(async () => {
  if (!root.value || mode.value === 'static') return
  const { gsap } = await loadGsap()
  if (isStatic.value) return
  ctx = gsap.context(() => {
    gsap.utils.toArray<HTMLElement>('[data-num]', root.value!).forEach((el) => {
      const end = Number(el.dataset.num)
      const o = { v: 0 }
      el.textContent = '0'
      gsap.to(o, {
        v: end,
        duration: 1.4,
        ease: 'power2.out',
        snap: { v: 1 },
        onUpdate: () => {
          el.textContent = String(o.v)
        },
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      })
    })
  }, root.value)
})
onBeforeUnmount(() => ctx?.revert())
const numeric = (v: string) => /^\d+$/.test(v)
</script>

<template>
  <section
    ref="root"
    class="on-dark relative z-10 bg-ok-red-deep px-4 py-16 text-ok-white md:py-24"
    aria-labelledby="reperes-title"
  >
    <div class="wrap">
      <h2 id="reperes-title" class="text-title">{{ t('recette.reperes') }}</h2>
      <ul class="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <li v-for="(r, i) in props.items" :key="i" class="min-w-0 border-t-4 border-ok-yellow pt-4">
          <p
            class="giant text-[clamp(2.6rem,5.2vw,5rem)] !leading-[0.85] [overflow-wrap:anywhere] text-ok-yellow"
            :data-num="numeric(r.valeur) ? r.valeur : undefined"
          >
            {{ r.valeur }}
          </p>
          <p class="mt-2 text-lg font-bold">{{ r.label }}</p>
          <PlaceholderBadge :show="r.placeholder" class="mt-2" />
        </li>
      </ul>
    </div>
  </section>
</template>
