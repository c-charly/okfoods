/** Lit un token CSS à l'exécution (pour le canvas, qui ne comprend pas var(--…)). */
export function cssVar(name: string, fallback = '#000000'): string {
  if (!import.meta.client) return fallback
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
}
