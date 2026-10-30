import { existsSync, readdirSync, readFileSync, statSync, watch } from 'node:fs'
import { join } from 'node:path'
import { addTemplate, addTypeTemplate, defineNuxtModule, updateTemplates, useLogger } from '@nuxt/kit'
import * as S from '../schemas'

/**
 * Module local OK Foods
 *  1. Indexe `public/images/**` → import virtuel `#build/okfoods/image-index.mjs`.
 *     Un emplacement d'image est « rempli » dès que son fichier existe : aucun code à toucher.
 *  2. Valide le contenu (schémas Zod + références croisées) et FAIT ÉCHOUER LE BUILD si invalide.
 *     Avertit pour le droit à l'image des croqueurs.
 */
const IMAGE_EXT = /\.(png|jpe?g|webp|avif|svg)$/i

function scanImages(dir: string, base = '/images'): string[] {
  if (!existsSync(dir)) return []
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) out.push(...scanImages(full, `${base}/${name}`))
    else if (IMAGE_EXT.test(name)) out.push(`${base}/${name}`)
  }
  return out.sort()
}

const readJson = (file: string) => JSON.parse(readFileSync(file, 'utf8'))

export default defineNuxtModule({
  meta: { name: 'okfoods' },
  setup(_options, nuxt) {
    const logger = useLogger('okfoods')
    const root = nuxt.options.rootDir
    const imagesDir = join(root, 'public/images')

    // 1. Index des images ---------------------------------------------------
    addTemplate({
      filename: 'okfoods/image-index.mjs',
      write: true,
      getContents: () => `export default ${JSON.stringify(scanImages(imagesDir), null, 2)}\n`,
    })
    addTypeTemplate({
      filename: 'types/okfoods-image-index.d.ts',
      getContents: () =>
        `declare module '#build/okfoods/image-index.mjs' {\n  const files: string[]\n  export default files\n}\n`,
    })
    if (nuxt.options.dev && existsSync(imagesDir)) {
      try {
        watch(imagesDir, { recursive: true }, () => {
          void updateTemplates({ filter: (t) => t.filename === 'okfoods/image-index.mjs' })
        })
      } catch {
        /* watch récursif indisponible : redémarrer le serveur de dev */
      }
    }

    // 2. Validation du contenu ---------------------------------------------
    const errors: string[] = []
    const warnings: string[] = []
    const images = new Set(scanImages(imagesDir))

    const check = (label: string, schema: { safeParse: (v: unknown) => any }, data: unknown) => {
      const res = schema.safeParse(data)
      if (!res.success) {
        for (const issue of res.error.issues)
          errors.push(`${label} › ${issue.path.join('.') || '(racine)'} : ${issue.message}`)
      }
      return res.success
    }

    for (const lang of ['fr', 'en']) {
      const dir = join(root, 'content', lang)
      if (!existsSync(dir)) {
        if (lang === 'fr') errors.push('Le dossier content/fr est obligatoire (langue par défaut).')
        continue
      }
      const f = (name: string) => join(dir, name)
      const tag = (name: string) => `content/${lang}/${name}`

      const slugs = new Set<string>()
      const produitsDir = join(dir, 'produits')
      if (existsSync(produitsDir)) {
        for (const file of readdirSync(produitsDir).filter((x) => x.endsWith('.json'))) {
          const data = readJson(join(produitsDir, file))
          check(tag(`produits/${file}`), S.produitSchema, data)
          if (data.slug && `${data.slug}.json` !== file)
            errors.push(`${tag(`produits/${file}`)} : le slug « ${data.slug} » doit correspondre au nom du fichier`)
          slugs.add(data.slug)
        }
      }
      if (lang === 'fr' && slugs.size === 0) errors.push('content/fr/produits : au moins un produit est requis.')

      const singles: [string, { safeParse: (v: unknown) => any }][] = [
        ['recette.json', S.recetteSchema],
        ['postes.json', S.postesSchema],
        ['avis.json', S.avisSchema],
        ['lieu.json', S.lieuSchema],
        ['contact.json', S.contactSchema],
        ['site.json', S.siteSchema],
        ['ui.json', S.uiSchema],
      ]
      for (const [name, schema] of singles) {
        if (!existsSync(f(name))) {
          if (lang === 'fr') errors.push(`${tag(name)} est obligatoire.`)
          continue
        }
        check(tag(name), schema, readJson(f(name)))
      }

      if (existsSync(f('croqueurs.json'))) {
        const list = readJson(f('croqueurs.json'))
        if (check(tag('croqueurs.json'), S.croqueursSchema, list)) {
          const frSlugs =
            lang === 'fr'
              ? slugs
              : new Set(readdirSync(join(root, 'content/fr/produits')).map((x) => x.replace(/\.json$/, '')))
          for (const c of list) {
            if (!frSlugs.has(c.produit) && !slugs.has(c.produit))
              errors.push(`${tag('croqueurs.json')} › ${c.id} : le produit « ${c.produit} » n'existe pas`)
            if (!c.placeholder && !c.consentement)
              warnings.push(
                `${c.id} : photo réelle SANS consentement (droit à l'image) — elle ne sera pas affichée tant que « consentement » n'est pas à true.`,
              )
            if (!c.placeholder && c.image && !images.has(c.image))
              warnings.push(`${c.id} : fichier image introuvable (${c.image}) — le placeholder sera utilisé.`)
          }
          const featured = list.filter((c: any) => c.enAvant).length
          if (featured < 3 || featured > 5)
            warnings.push(
              `croqueurs.json (${lang}) : ${featured} scène(s) « enAvant » — 3 à 5 attendues pour « Face à face ».`,
            )
        }
      } else if (lang === 'fr') errors.push(`${tag('croqueurs.json')} est obligatoire.`)
    }

    const manifestFile = join(root, 'content/images.manifest.json')
    if (existsSync(manifestFile)) {
      const manifest = readJson(manifestFile)
      if (check('content/images.manifest.json', S.imageManifestSchema, manifest)) {
        const ids = manifest.images.map((i: { id: string }) => i.id)
        const dup = ids.filter((id: string, i: number) => ids.indexOf(id) !== i)
        if (dup.length) errors.push(`images.manifest.json : identifiants en double (${[...new Set(dup)].join(', ')})`)
      }
    } else errors.push('content/images.manifest.json est obligatoire.')

    for (const w of warnings) logger.warn(w)
    if (errors.length) {
      logger.error(`Contenu invalide (${errors.length} erreur(s)) :\n  - ${errors.join('\n  - ')}`)
      throw new Error(
        `[okfoods] Contenu invalide : ${errors.length} erreur(s). Corrigez les fichiers listés ci-dessus.`,
      )
    }
  },
})
