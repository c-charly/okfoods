import type { Dict } from '~/types/content'

/**
 * Lecture du contenu localisé. Règle : « un contenu manquant en EN retombe sur le FR (jamais de page vide) ».
 * Collections : `<nom>_fr` et `<nom>_en` (voir content.config.ts).
 */
const q = (name: string, lang: string): any => (queryCollection as any)(`${name}_${lang}`)

export async function loadList<T extends Dict>(
  name: string,
  locale: string,
  key: keyof T & string,
  orderBy?: string,
): Promise<T[]> {
  const get = async (l: string): Promise<T[]> => {
    let c = q(name, l)
    if (orderBy) c = c.order(orderBy, 'ASC')
    return (await c.all()) as T[]
  }
  const fr = await get('fr')
  if (locale === 'fr') return fr
  const other = await get(locale).catch(() => [] as T[])
  return mergeByKey(fr, other, key)
}

export async function loadOne<T extends Dict>(name: string, locale: string, deep = false): Promise<T | null> {
  const fr = (await q(name, 'fr').first()) as T | null
  if (locale === 'fr') return fr
  const other = (await q(name, locale)
    .first()
    .catch(() => null)) as T | null
  if (!other) return fr
  return deep && fr ? deepMerge(fr, other) : other
}

/** Fichiers-tableaux (avis, croqueurs, postes) : @nuxt/content les expose sous `body`. */
export async function loadBody<T>(name: string, locale: string): Promise<T[]> {
  const doc = await loadOne<{ body: T[] }>(name, locale)
  return doc?.body ?? []
}

/** Contenu global (ui, site, lieu) chargé une fois dans app.vue et partagé par `useState`. */
export async function useGlobalContent() {
  const { locale } = useI18n()
  const ui = useState<Dict>('ok-ui', () => ({}))
  const site = useState<Dict | null>('ok-site', () => null)
  const lieu = useState<Dict | null>('ok-lieu', () => null)
  await useAsyncData(
    'ok-global',
    async () => {
      const [u, s, l] = await Promise.all([
        loadOne<Dict>('ui', locale.value, true),
        loadOne<Dict>('site', locale.value, true),
        loadOne<Dict>('lieu', locale.value),
      ])
      ui.value = u ?? {}
      site.value = s
      lieu.value = l
      return true
    },
    { watch: [locale] },
  )
}

export function useUi() {
  const ui = useState<Dict>('ok-ui', () => ({}))
  const get = (path: string): any => path.split('.').reduce<any>((o, k) => (o == null ? o : o[k]), ui.value)
  /** Libellé d'interface (ui.json) ; `{var}` remplacés. Retourne la clé si absente (visible en dev). */
  const t = (path: string, vars?: Record<string, string | number>): string => {
    const v = get(path)
    return typeof v === 'string' ? fmt(v, vars) : path
  }
  /** Valeur brute (tableau, objet) d'ui.json. */
  const raw = <T = any>(path: string): T | undefined => get(path)
  return { t, raw, ui }
}

export const useSite = () => useState<Dict | null>('ok-site', () => null)
export const useLieu = () => useState<Dict | null>('ok-lieu', () => null)
