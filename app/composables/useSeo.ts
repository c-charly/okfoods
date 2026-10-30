/** SEO par page : titre/description uniques issus des données, Open Graph, hreflang, canonical. */
export function useSeo(key: string, opts: { title?: string; description?: string; noindex?: boolean } = {}) {
  const { t } = useUi()
  const { locale, locales } = useI18n()
  const switchPath = useSwitchLocalePath()
  const config = useRuntimeConfig()
  const images = useImages()
  const base = String(config.public.siteUrl || '').replace(/\/$/, '')

  const title = computed(() => opts.title ?? t(`seo.${key}.title`))
  const description = computed(() => opts.description ?? t(`seo.${key}.description`))
  const ogImage = computed(() => `${base}${images.resolve('/og/og-image.png') ?? '/og/og-default.png'}`)
  const abs = (code: string) => `${base}${switchPath(code as 'fr' | 'en') || '/'}`

  useHead(() => ({
    title: title.value,
    htmlAttrs: { lang: locale.value },
    link: [
      { rel: 'canonical' as const, href: abs(locale.value) },
      ...(locales.value as { code: string }[]).map((l) => ({
        rel: 'alternate' as const,
        hreflang: l.code,
        href: abs(l.code),
      })),
      { rel: 'alternate' as const, hreflang: 'x-default', href: abs('fr') },
    ],
    meta: opts.noindex ? [{ name: 'robots', content: 'noindex' }] : [],
  }))
  useSeoMeta({
    description: () => description.value,
    ogTitle: () => title.value,
    ogDescription: () => description.value,
    ogType: 'website',
    ogImage: () => ogImage.value,
    ogUrl: () => abs(locale.value),
    ogLocale: () => (locale.value === 'en' ? 'en_GB' : 'fr_FR'),
    twitterCard: 'summary_large_image',
    twitterImage: () => ogImage.value,
  })
}

export function useJsonLd(data: () => Record<string, unknown> | Record<string, unknown>[] | null) {
  useHead(() => {
    const d = data()
    return d
      ? {
          script: [
            {
              type: 'application/ld+json',
              innerHTML: JSON.stringify(d),
              key: `ld-${Math.abs(JSON.stringify(d).length)}`,
            },
          ],
        }
      : {}
  })
}
