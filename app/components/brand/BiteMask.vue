<script setup lang="ts">
import type { Produit } from '~/types/content'

/**
 * « Le produit se croque » : masque SVG dont les cercles rongent le contour réel de l'image
 * (ou de la silhouette de repli). 3 niveaux, puis « Remanger ». Les trois états de mouvement sont gérés :
 * complet (rebond + vibration), allégé (rebond), statique (simple passage entier → croqué).
 */
const props = defineProps<{ product: Produit }>()
const emit = defineEmits<{ bite: [payload: { level: number; x: number; y: number }]; reset: [] }>()

const { resolve } = useImages()
const $img = useImage()
const { mode } = useMotion()

const resolved = computed(() => resolve(props.product.image))
const src = computed(() =>
  resolved.value ? $img(resolved.value, { width: 960, format: 'webp', quality: 80 }) : undefined,
)
const kind = computed(() => props.product.kind)
const { level, holes, done, bite, reset } = useBite(src, kind)

const maskId = `m${useId()}`
const svg = ref<SVGSVGElement>()
const bouncing = ref(false)

function doBite() {
  if (done.value) return
  const lv = bite()
  const h = holes.value[lv - 1]?.[1]
  const r = svg.value?.getBoundingClientRect()
  emit('bite', {
    level: lv,
    x: r && h ? r.left + (h.cx / 100) * r.width : 0,
    y: r && h ? r.top + (h.cy / 100) * r.height : 0,
  })
  if (mode.value !== 'static') {
    bouncing.value = false
    requestAnimationFrame(() => {
      bouncing.value = true
    })
    window.setTimeout(() => {
      bouncing.value = false
    }, 520)
  }
}
function doReset() {
  reset()
  emit('reset')
}
defineExpose({ bite: doBite, reset: doReset, level, done })
</script>

<template>
  <div class="bite-wrap" :class="{ bouncing, shake: bouncing && mode === 'full' }" @click="doBite">
    <svg ref="svg" viewBox="0 0 100 100" class="h-full w-full" role="img" :aria-label="product.name">
      <defs>
        <mask :id="maskId" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
          <rect width="100" height="100" fill="white" />
          <template v-for="(cluster, i) in holes" :key="i">
            <circle
              v-for="(c, j) in cluster"
              :key="j"
              class="hole"
              :class="{ on: level > i }"
              :cx="c.cx"
              :cy="c.cy"
              :r="c.r"
              fill="black"
              :style="{ '--d': `${j * 45}ms` }"
            />
          </template>
        </mask>
      </defs>
      <g :mask="`url(#${maskId})`">
        <image v-if="src" :href="src" x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid meet" />
        <ProductSilhouette
          v-else
          :kind="product.kind"
          :name="product.name"
          :color="product.color"
          :accent="product.accentColor"
        />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.bite-wrap {
  cursor: pointer;
}
.hole {
  transform: scale(0);
  transform-box: fill-box;
  transform-origin: center;
  transition: transform 0.26s var(--ease-spring);
  transition-delay: var(--d, 0ms);
}
.hole.on {
  transform: scale(1);
}
.bouncing {
  animation: ok-bounce 0.45s var(--ease-out);
}
.shake {
  animation:
    ok-bounce 0.45s var(--ease-out),
    ok-shake 0.28s linear;
}
</style>
