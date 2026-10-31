<script setup lang="ts">
import type { Produit } from '~/types/content'

/**
 * Accueil 1/6 - " Le Sachet ".
 *  desktop : le sachet se déchire AU SCROLL (section haute + contenu collant natif, pas de scroll-jacking) ;
 *  mobile  : il se déchire tout seul en ~ 2 s (bouton " Passer ") ; reduced-motion : état ouvert, sans mouvement.
 * Le titre et la phrase de marque sont dans le DOM et visibles dès la première seconde.
 */
const props = defineProps<{ products: Produit[] }>()
const { t } = useUi()
const { mode, isStatic, isTall } = useMotion()
const images = useImages()

const root = ref<HTMLElement>()
const sachet = ref<SVGSVGElement>()
const crumbs = ref<{ burst: (x: number, y: number, c: string, n?: number) => void }>()
const pre = ref(true)
const picks = computed(() => props.products.slice(0, 4))
const spots = [
  { left: '1%', bottom: '4%', size: '33%', rot: -14 },
  { left: '64%', bottom: '6%', size: '35%', rot: 12 },
  { left: '20%', bottom: '-6%', size: '28%', rot: 7 },
  { left: '47%', bottom: '-4%', size: '28%', rot: -9 },
]
const logo = computed(() => images.resolve('/images/brand/logo-blanc.svg'))

// Géométrie du sachet : bords crantés + déchirure irrégulière (la même pour le rabat et le corps)
const teeth = (y0: number, y1: number, n = 12) => {
  const s = 252 / n
  let d = ''
  for (let i = 0; i < n; i++) d += ` L${24 + s * i + s / 2} ${y0} L${24 + s * (i + 1)} ${y1}`
  return d
}
const jag = Array.from({ length: 15 }, (_, i) => [24 + 18 * i, i % 2 ? 94 : 78] as const)
const flapD = `M24 22${teeth(6, 22)} L276 78 ${[...jag]
  .reverse()
  .map(([x, y]) => `L${x} ${y}`)
  .join(' ')} Z`
const bodyD = `M24 78 ${jag.map(([x, y]) => `L${x} ${y}`).join(' ')} C294 170 294 300 276 392 L24 392 C6 300 6 170 24 78 Z`
const bottomD = `M24 392${teeth(410, 392)} Z`

let tl: { progress: (v?: number) => any; play: () => any; kill: () => any } | null = null
let ctx: { revert: () => void } | null = null

function mouth() {
  const r = sachet.value!.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height * 0.18 }
}

onMounted(async () => {
  if (!root.value || !sachet.value) return
  if (mode.value === 'static') {
    pre.value = false
    return
  }
  const { gsap } = await loadGsap()
  if (isStatic.value) {
    pre.value = false
    return
  }
  const el = root.value
  ctx = gsap.context(() => {
    const prods = gsap.utils.toArray<HTMLElement>('[data-prod]', el)
    const m = mouth()
    const off = (p: HTMLElement) => {
      const r = p.getBoundingClientRect()
      return { dx: m.x - (r.left + r.width / 2), dy: m.y - (r.top + r.height / 2) }
    }
    const line = gsap.timeline({ paused: true })
    line.to(sachet.value!, { keyframes: { x: [0, -5, 5, -3, 3, 0] }, duration: 0.4, ease: 'none' }, 0)
    line.to(
      '[data-flap]',
      { rotation: -32, x: -90, y: -170, transformOrigin: '0% 100%', duration: 0.6, ease: 'power3.out' },
      0.3,
    )
    line.to('[data-flap]', { opacity: 0, duration: 0.3, ease: 'none' }, 0.6)
    line.fromTo(
      prods,
      { x: (_i, p) => off(p).dx, opacity: 0, scale: 0.2, rotation: () => gsap.utils.random(-120, 120) },
      {
        x: 0,
        opacity: 1,
        scale: 1,
        rotation: (i) => spots[i]?.rot ?? 0,
        duration: 0.95,
        ease: 'power2.out',
        stagger: 0.09,
      },
      0.55,
    )
    line.fromTo(prods, { y: (_i, p) => off(p).dy }, { y: 0, duration: 0.95, ease: 'bounce.out', stagger: 0.09 }, 0.55)
    line.call(
      () => crumbs.value?.burst(m.x, m.y, picks.value[0]?.crumbColor ?? '#C98A3B', mode.value === 'full' ? 28 : 12),
      [],
      0.8,
    )
    tl = line
    pre.value = false // les produits passent sous le contrôle de la timeline (état de départ déjà posé)

    if (isTall()) {
      gsap.to(line, {
        progress: 1,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: 0.6 },
      })
    } else {
      gsap.delayedCall(0.25, () => line.play()) // mobile / appareil lent : automatique, ~ 2 s
    }
  }, el)
})
onBeforeUnmount(() => {
  ctx?.revert()
  tl = null
})

const skip = () => tl?.progress(1)
const tear = () => {
  const el = root.value
  if (el) window.scrollTo({ top: el.offsetTop + el.offsetHeight - window.innerHeight, behavior: 'smooth' })
}
</script>

<template>
  <section ref="root" class="opening relative bg-ok-cream text-ok-blue" aria-labelledby="home-title">
    <div class="opening-stick relative flex flex-col items-center overflow-hidden px-4 pb-6 pt-6 md:pt-8">
      <h1 id="home-title" class="giant relative z-20 text-center">{{ t('home.open.title') }}</h1>
      <p class="sub mt-3 max-w-[28ch] text-center">{{ t('home.open.line') }}</p>

      <div class="opening-stage relative mt-2 w-full max-w-3xl flex-1">
        <div
          class="absolute left-1/2 top-[8%] h-[78%] w-[min(88%,34rem)] -translate-x-1/2 bg-ok-yellow blob-a"
          aria-hidden="true"
        />
        <div class="absolute inset-x-0 top-0 z-10 flex h-[86%] justify-center">
          <svg
            ref="sachet"
            viewBox="0 0 300 420"
            class="h-full w-auto overflow-visible"
            role="img"
            :aria-label="t('a11y.decorative')"
          >
            <g data-body>
              <path :d="bodyD" class="f-blue" />
              <path
                d="M52 110 C40 200 40 300 52 380 L74 380 C64 300 64 200 74 110 Z"
                class="f-blue-soft"
                opacity="0.55"
              />
              <path :d="bottomD" class="f-blue-deep" />
              <circle cx="150" cy="224" r="56" class="f-red" />
              <image
                v-if="logo"
                :href="logo"
                x="88"
                y="196"
                width="124"
                height="60"
                preserveAspectRatio="xMidYMid meet"
              />
              <template v-else>
                <text x="150" y="243" text-anchor="middle" font-size="52" class="font-display f-white">OK</text>
                <text x="150" y="312" text-anchor="middle" font-size="40" class="font-display f-yellow">Foods</text>
              </template>
            </g>
            <path data-flap :d="flapD" class="f-blue-deep" />
          </svg>
        </div>
        <ul class="pointer-events-none absolute inset-0 z-20" aria-hidden="true">
          <li
            v-for="(p, i) in picks"
            :key="p.slug"
            data-prod
            class="absolute aspect-square"
            :class="{ 'opacity-0': pre }"
            :style="{
              left: spots[i]!.left,
              bottom: spots[i]!.bottom,
              width: spots[i]!.size,
              rotate: `${spots[i]!.rot}deg`,
            }"
          >
            <ProductArt :product="p" />
          </li>
        </ul>
        <Crumbs ref="crumbs" class="z-30" />
      </div>

      <div class="mt-3 flex min-h-12 flex-wrap items-center justify-center gap-3">
        <Btn variant="blue" class="tear-btn" @click="tear">{{ t('home.open.tear') }}</Btn>
        <Btn variant="ghost" class="skip-btn" @click="skip">{{ t('home.open.skip') }}</Btn>
        <p class="opening-hint font-bold" aria-hidden="true">
          <UiIcon name="arrow-down" size="h-5 w-5" />{{ t('home.open.scroll') }}
        </p>
      </div>
    </div>
  </section>
</template>

<style>
/* Styles NON scopés : les sélecteurs html[data-motion] ne survivent pas à `scoped` + `:global()` */
.opening-stick {
  min-height: calc(100svh - 3.5rem);
}
.opening-stage {
  min-height: 21rem;
}
.tear-btn,
.skip-btn,
.opening-hint {
  display: none;
}
html[data-layout='tall']:not([data-motion='static']) .tear-btn {
  display: inline-flex;
}
html[data-layout='flat']:not([data-motion='static']) .skip-btn {
  display: inline-flex;
}
html[data-layout='tall']:not([data-motion='static']) .opening-hint {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
@media (hover: hover) and (pointer: fine) and (min-width: 1024px) {
  html[data-layout='tall'] .opening {
    height: 230svh;
  }
  html[data-layout='tall'] .opening-stick {
    position: sticky;
    top: 3.5rem;
    height: calc(100svh - 3.5rem);
  }
}
@media (max-width: 1023px) {
  .opening-stick {
    min-height: calc(100svh - 3.5rem - var(--bottom-nav-h));
  }
}
</style>
