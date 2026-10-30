const ALT_EXT = ['jpg', 'jpeg', 'webp', 'png', 'avif']

/**
 * Retrouve le fichier réellement présent pour un chemin attendu (`/images/x/croqueur-01.jpg`).
 * Tolère un autre format avec le même nom (.webp, .png…). Retourne `null` si absent → placeholder.
 */
export function resolveImage(path: string | undefined, index: readonly string[] | Set<string>): string | null {
  if (!path) return null
  const set = index instanceof Set ? index : new Set(index)
  if (set.has(path)) return path
  const dot = path.lastIndexOf('.')
  const base = dot > 0 ? path.slice(0, dot) : path
  for (const ext of ALT_EXT) if (set.has(`${base}.${ext}`)) return `${base}.${ext}`
  return null
}

export const fileName = (path: string) => path.split('/').pop() ?? path

export function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]!.toUpperCase())
      .join('') || '?'
  )
}

/** Ratio « 4:5 » → 0.8 (null si « libre »). */
export function ratioValue(ratio: string): number | null {
  const m = /^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)$/.exec(ratio)
  return m ? Number(m[1]) / Number(m[2]) : null
}
