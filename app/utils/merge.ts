const isObj = (v: unknown): v is Record<string, any> => !!v && typeof v === 'object' && !Array.isArray(v)

/** Fusion profonde : `over` écrase `base`. Les tableaux sont remplacés en bloc. */
export function deepMerge<T>(base: T, over: any): T {
  if (!isObj(base) || !isObj(over)) return (over ?? base) as T
  const out: Record<string, any> = { ...base }
  for (const k of Object.keys(over)) out[k] = k in base ? deepMerge((base as any)[k], over[k]) : over[k]
  return out as T
}

/** Liste de base (FR) dont les éléments sont remplacés par ceux de `over` (EN) ayant la même clé. */
export function mergeByKey<T extends Record<string, any>>(base: T[], over: T[], key: keyof T): T[] {
  const map = new Map(over.map((o) => [o[key], o]))
  return base.map((b) => map.get(b[key]) ?? b)
}
