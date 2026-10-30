/** Sitemap généré depuis la liste des pages × langues, avec hreflang. */
const PAGES = [
  '',
  '/produits',
  '/recette',
  '/nous-trouver',
  '/team-bleue',
  '/ils-en-parlent',
  '/contact',
  '/mentions-legales',
  '/confidentialite',
]
const LOCALES = [
  { code: 'fr', prefix: '' },
  { code: 'en', prefix: '/en' },
]

export default defineEventHandler((event) => {
  const base = String(useRuntimeConfig(event).public.siteUrl).replace(/\/$/, '')
  const url = (prefix: string, page: string) => `${base}${prefix}${page}` || `${base}/`
  const rows = PAGES.flatMap((page) =>
    LOCALES.map((l) => {
      const alts = [
        ...LOCALES.map((a) => `    <xhtml:link rel="alternate" hreflang="${a.code}" href="${url(a.prefix, page)}"/>`),
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${url('', page)}"/>`,
      ].join('\n')
      return `  <url>\n    <loc>${url(l.prefix, page)}</loc>\n${alts}\n  </url>`
    }),
  )
  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${rows.join('\n')}\n</urlset>\n`
})
