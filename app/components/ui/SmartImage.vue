<script setup lang="ts">
/**
 * Image pilotée par le manifeste (`content/images.manifest.json`) :
 *  fichier présent → image optimisée (AVIF/WebP, lazy, width/height réservés) ; absent → placeholder.
 * Aucun code à modifier quand les vraies images arrivent. `alt` est toujours défini.
 */
const props = withDefaults(
  defineProps<{
    id?: string
    src?: string
    alt?: string
    width?: number
    height?: number
    eager?: boolean
    sizes?: string
    tint?: string
    initials?: string
    variant?: 'person' | 'scene' | 'product'
    fit?: 'cover' | 'contain'
    /** Force le placeholder même si le fichier existe (ex. consentement droit à l'image manquant). */
    forcePlaceholder?: boolean
  }>(),
  { fit: 'cover', variant: 'scene', sizes: 'xs:100vw md:50vw' },
)

const images = useImages()
const entry = computed(() => (props.id ? images.entry(props.id) : undefined))
const path = computed(() => props.src ?? entry.value?.path)
const file = computed(() => (props.forcePlaceholder ? null : images.resolve(path.value)))
const w = computed(() => props.width ?? (entry.value?.minWidth || 1200))
const ratio = computed(
  () => ratioValue(entry.value?.ratio ?? '') ?? (props.width && props.height ? props.width / props.height : 1),
)
const h = computed(() => props.height ?? Math.round(w.value / ratio.value))
const isSvg = computed(() => file.value?.endsWith('.svg'))
const cls = computed(() => `h-full w-full ${props.fit === 'contain' ? 'object-contain' : 'object-cover'}`)
</script>

<template>
  <div class="relative overflow-hidden" :style="{ aspectRatio: `${w} / ${h}` }">
    <img v-if="file && isSvg" :src="file" :alt="alt ?? ''" :width="w" :height="h" :class="cls" />
    <NuxtPicture
      v-else-if="file"
      :src="file"
      :alt="alt ?? ''"
      :width="w"
      :height="h"
      format="avif,webp"
      :sizes="sizes"
      :loading="eager ? 'eager' : 'lazy'"
      :img-attrs="{ class: cls }"
    />
    <ImagePlaceholder
      v-else
      :label="path ? fileName(path) : undefined"
      :alt="alt"
      :tint="tint"
      :initials="initials"
      :variant="variant"
    />
  </div>
</template>
