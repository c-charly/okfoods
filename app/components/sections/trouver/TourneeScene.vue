<script setup lang="ts">
/**
 * " La Tournée " : illustration SVG stylisée de Douala -> Bonabéri par le pont du Wouri.
 * Un tricycle suit le tracé (scroll sur desktop ; automatique à l'arrivée dans la zone sur mobile),
 * en laissant une traînée de miettes. Reduced-motion : le tricycle est déjà arrivé, sans mouvement.
 */
const { t } = useUi()
const { mode, isStatic, isTall } = useMotion()
const maskId = `trail${useId()}`
const el = ref<HTMLElement>()
const route = ref<SVGPathElement>()
const trail = ref<SVGPathElement>()
const trike = ref<SVGGElement>()
const moving = ref(false)
const ready = ref(false)
let L = 0
let ctx: { revert: () => void } | null = null

const ROUTE = 'M590 258 C540 258 480 230 430 210 L230 210 C180 210 130 250 84 262'
const towers: [number, number, number, number][] = [
  [420, 150, 26, 60],
  [452, 120, 30, 90],
  [488, 140, 24, 70],
  [520, 100, 34, 110],
  [560, 132, 28, 78],
  [596, 110, 30, 100],
]
const houses: [number, number][] = [
  [24, 262],
  [60, 286],
  [112, 296],
  [150, 270],
  [190, 300],
]

function setP(p: number) {
  const r = route.value
  const g = trike.value
  if (!r || !g) return
  const pt = r.getPointAtLength(L * p)
  const ahead = r.getPointAtLength(Math.min(L, L * p + 3))
  const slope = Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * (180 / Math.PI) // route vers la gauche : ~ 180 deg +/- pente
  const tilt = Math.max(-14, Math.min(14, (slope > 0 ? slope - 180 : slope + 180) * -0.5))
  g.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)}) rotate(${tilt.toFixed(1)})`)
  if (trail.value) trail.value.style.strokeDashoffset = String(L * (1 - p))
}

onMounted(async () => {
  if (!el.value || !route.value) return
  L = route.value.getTotalLength()
  if (trail.value) trail.value.style.strokeDasharray = `${L}`
  ready.value = true
  if (mode.value === 'static') {
    setP(1)
    return
  }
  setP(0)
  const { gsap } = await loadGsap()
  if (isStatic.value) {
    setP(1)
    return
  }
  const host = el.value.closest<HTMLElement>('[data-tour]') ?? el.value
  ctx = gsap.context(() => {
    const state = { p: 0 }
    if (isTall()) {
      gsap.to(state, {
        p: 1,
        ease: 'none',
        onUpdate: () => {
          setP(state.p)
          moving.value = state.p > 0 && state.p < 1
        },
        scrollTrigger: { trigger: host, start: 'top top+=56', end: 'bottom bottom', scrub: 0.5 },
      })
    } else {
      gsap.to(state, {
        p: 1,
        duration: 4.5,
        ease: 'power1.inOut',
        paused: false,
        onStart: () => {
          moving.value = true
        },
        onUpdate: () => setP(state.p),
        onComplete: () => {
          moving.value = false
        },
        scrollTrigger: { trigger: el.value, start: 'top 75%', once: true },
      })
    }
  }, host)
})
onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <div ref="el" class="w-full">
    <svg
      viewBox="0 0 640 400"
      class="h-auto w-full"
      role="img"
      :aria-label="`${t('trouver.from')}, ${t('trouver.bridge')}, ${t('trouver.to')}`"
    >
      <rect width="640" height="400" rx="36" class="f-cream" />
      <!-- Le Wouri -->
      <path d="M270 0 C240 120 330 200 290 400 L400 400 C440 200 350 120 390 0 Z" class="f-blue-soft" opacity="0.55" />
      <text
        x="338"
        y="342"
        text-anchor="middle"
        font-size="22"
        transform="rotate(-8 338 342)"
        class="f-blue"
        style="font-family: var(--ok-font-serif); font-style: italic"
      >
        {{ t('trouver.river') }}
      </text>
      <!-- Douala : tours -->
      <g>
        <rect
          v-for="(b, i) in towers"
          :key="i"
          :x="b[0]"
          :y="258 - b[3]"
          :width="b[2]"
          :height="b[3]"
          rx="3"
          :class="['f-blue', 'f-red', 'f-blue-deep', 'f-blue', 'f-red', 'f-blue-deep'][i]"
        />
        <rect
          v-for="(b, i) in towers"
          :key="`w${i}`"
          :x="b[0] + 6"
          :y="258 - b[3] + 10"
          width="6"
          height="6"
          class="f-yellow"
        />
      </g>
      <rect x="400" y="258" width="240" height="6" class="f-ink" opacity="0.18" />
      <text x="612" y="40" text-anchor="end" font-size="30" class="font-display f-blue">{{ t('trouver.from') }}</text>
      <!-- Bonabéri : maisons + usine -->
      <g>
        <g v-for="(h, i) in houses" :key="i">
          <rect :x="h[0]" :y="h[1] - 26" width="34" height="26" class="f-yellow" />
          <path
            :d="`M${h[0] - 4} ${h[1] - 26} L${h[0] + 17} ${h[1] - 44} L${h[0] + 38} ${h[1] - 26} Z`"
            class="f-red"
          />
        </g>
        <rect x="14" y="170" width="70" height="50" class="f-blue" />
        <rect x="64" y="136" width="12" height="40" class="f-blue-deep" />
      </g>
      <text x="28" y="40" font-size="30" class="font-display f-blue">{{ t('trouver.to') }}</text>
      <!-- Pont du Wouri -->
      <g>
        <rect x="226" y="204" width="208" height="14" rx="3" class="f-ink" />
        <path
          d="M250 204 Q262 150 276 204 M300 204 Q330 120 360 204 M384 204 Q396 150 410 204"
          fill="none"
          class="s-red"
          stroke-width="5"
          stroke-linecap="round"
        />
        <path
          d="M300 204 V190 M315 204 V160 M330 204 V140 M345 204 V160 M360 204 V190"
          class="s-red"
          stroke-width="2"
        />
        <text
          x="330"
          y="120"
          text-anchor="middle"
          font-size="19"
          class="f-ink"
          style="font-family: var(--ok-font-serif); font-style: italic; font-weight: 600"
        >
          {{ t('trouver.bridge') }}
        </text>
      </g>
      <!-- Tracé + traînée de miettes -->
      <path
        ref="route"
        :d="ROUTE"
        fill="none"
        class="s-ink"
        stroke-width="3"
        stroke-dasharray="2 10"
        stroke-linecap="round"
        opacity="0.35"
      />
      <defs>
        <mask :id="maskId"><path ref="trail" :d="ROUTE" fill="none" stroke="white" stroke-width="24" /></mask>
      </defs>
      <path
        :d="ROUTE"
        fill="none"
        class="s-red"
        stroke-width="7"
        stroke-linecap="round"
        style="stroke-dasharray: 0.1 14"
        :mask="`url(#${maskId})`"
      />
      <!-- Destination -->
      <g transform="translate(84 262)">
        <path d="M0 0 C-20 -26 -22 -34 -22 -40 a22 22 0 0 1 44 0 c0 6 -2 14 -22 40Z" class="f-red" />
        <text y="-34" text-anchor="middle" font-size="15" class="font-display f-white">OK</text>
      </g>
      <!-- Tricycle (miroir : il roule vers la gauche) -->
      <g ref="trike" :style="{ opacity: ready ? 1 : 0 }" transform="translate(590 258)">
        <g transform="scale(-1 1)"><Tricycle :moving="moving" x="-52" y="-64" width="104" height="68" /></g>
      </g>
    </svg>
  </div>
</template>
