import imageIndex from '#build/okfoods/image-index.mjs'
import manifest from '~~/content/images.manifest.json'
import type { ManifestEntry } from '~/types/content'

const FILES = new Set<string>(imageIndex)
const BY_ID = new Map<string, ManifestEntry>((manifest.images as ManifestEntry[]).map((e) => [e.id, e]))

/** Accès aux images : présence réelle des fichiers (index généré au build) + manifeste des emplacements. */
export function useImages() {
  const config = useRuntimeConfig()
  const flag = config.public.showPlaceholders as unknown
  return {
    resolve: (path?: string) => resolveImage(path, FILES),
    has: (path?: string) => resolveImage(path, FILES) !== null,
    entry: (id: string) => BY_ID.get(id),
    showLabels: flag === true || flag === 'true',
  }
}
