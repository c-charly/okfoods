<script setup lang="ts">
import type { CrumbEngine } from '~/utils/crumbEngine'

/**
 * Calque canvas de miettes.
 *  mode="burst" : éclats à la demande (`burst()`), moteur créé à la volée puis détruit quand il n'y a plus de particules.
 *  mode="pile"  : tas persistant qu'on disperse au doigt / à la souris (pied de page).
 */
const props = withDefaults(defineProps<{ mode?: 'burst' | 'pile'; colors?: string[]; count?: number }>(), {
  mode: 'burst',
  colors: () => [],
  count: 120,
})
const canvas = ref<HTMLCanvasElement>()
const { mode: motion } = useMotion()
let engine: CrumbEngine | null = null
let pending: Promise<CrumbEngine | null> | null = null
let ro: ResizeObserver | null = null
let io: IntersectionObserver | null = null

// desktop : Matter.js (<= 150) - mobile / appareil lent : canvas simple (~ 20)
const caps = () =>
  motion.value === 'full' ? { physics: true, max: 150 } : { physics: false, max: props.mode === 'pile' ? 40 : 20 }

async function ensure(): Promise<CrumbEngine | null> {
  if (engine) return engine
  if (!canvas.value || motion.value === 'static') return null
  pending ??= createCrumbEngine(canvas.value, { ...caps(), persistent: props.mode === 'pile' }).then((e) => {
    engine = e
    if (props.mode === 'burst') e.onIdle = destroy
    return e
  })
  return pending
}
function destroy() {
  engine?.destroy()
  engine = null
  pending = null
}

async function burst(clientX: number, clientY: number, color: string, n?: number) {
  const e = await ensure()
  const el = canvas.value
  if (!e || !el) return
  const r = el.getBoundingClientRect()
  e.spawn(clientX - r.left, clientY - r.top, color, n ?? (motion.value === 'full' ? 22 : 9))
}

async function startPile() {
  if (props.mode !== 'pile' || !canvas.value) return
  const colors = props.colors.length
    ? props.colors
    : [cssVar('--ok-cream'), cssVar('--ok-yellow'), cssVar('--ok-red'), cssVar('--ok-white')]
  if (motion.value === 'static') {
    // Aucun mouvement : tas dessiné une seule fois (version légère)
    const e = await createCrumbEngine(canvas.value, { physics: false, max: 40, persistent: true })
    e.fillPile(colors, 40)
    engine = e
    return
  }
  const e = await ensure()
  e?.fillPile(colors, motion.value === 'full' ? props.count : 40)
}

function poke(ev: PointerEvent) {
  if (props.mode !== 'pile' || motion.value === 'static' || !engine || !canvas.value) return
  const r = canvas.value.getBoundingClientRect()
  engine.impulse(ev.clientX - r.left, ev.clientY - r.top)
}

onMounted(() => {
  if (!canvas.value) return
  ro = new ResizeObserver(() => engine?.resize())
  ro.observe(canvas.value)
  if (props.mode === 'pile') {
    // Le tas n'existe (et ne consomme) que lorsqu'il est visible
    io = new IntersectionObserver(([entry]) => (entry?.isIntersecting ? startPile() : destroy()), { threshold: 0.05 })
    io.observe(canvas.value)
  }
})
onBeforeUnmount(() => {
  ro?.disconnect()
  io?.disconnect()
  destroy()
})

defineExpose({ burst })
</script>

<template>
  <canvas
    ref="canvas"
    aria-hidden="true"
    class="absolute inset-0 h-full w-full"
    :class="mode === 'pile' ? 'pointer-events-auto' : 'pointer-events-none'"
    :style="mode === 'pile' ? 'touch-action: pan-y' : undefined"
    @pointermove="poke"
    @pointerdown="poke"
  />
</template>
