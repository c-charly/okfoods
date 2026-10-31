import type { Hole } from '~/utils/bite'

export type ProductKind = 'biscuit' | 'sachet' | 'bonbon'

/**
 * Logique de la morsure : 3 niveaux, puis " Remanger " réinitialise.
 * Les positions sont calculées depuis le contour RÉEL de l'image (échantillonnage canvas des pixels
 * non transparents) ; sans image, depuis le contour de la silhouette de repli.
 */
export function useBite(src: Ref<string | undefined>, kind: Ref<ProductKind>) {
  const level = ref(0)
  const holes = ref<Hole[][]>(computeBitePositions(silhouetteEdge(kind.value), 3, 11))
  const SIZE = 96

  async function analyse() {
    if (!import.meta.client) return
    if (!src.value) {
      holes.value = computeBitePositions(silhouetteEdge(kind.value), 3, 11)
      return
    }
    try {
      const img = new Image()
      img.decoding = 'async'
      img.src = src.value
      await img.decode()
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = SIZE
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!
      const k = Math.min(SIZE / img.width, SIZE / img.height) // même cadrage que preserveAspectRatio="meet"
      const w = img.width * k
      const h = img.height * k
      ctx.drawImage(img, (SIZE - w) / 2, (SIZE - h) / 2, w, h)
      const edge = edgePointsFromRgba(ctx.getImageData(0, 0, SIZE, SIZE).data, SIZE, SIZE)
      let seed = 0
      for (const ch of src.value) seed = (seed * 31 + ch.charCodeAt(0)) | 0
      holes.value = computeBitePositions(edge, 3, Math.abs(seed))
    } catch {
      holes.value = computeBitePositions(silhouetteEdge(kind.value), 3, 11)
    }
  }
  watch([src, kind], analyse, { immediate: true })

  return {
    level,
    holes,
    done: computed(() => level.value >= 3),
    bite: () => (level.value < 3 ? ++level.value : level.value),
    reset: () => {
      level.value = 0
    },
  }
}
