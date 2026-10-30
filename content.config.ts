import { defineCollection, defineContentConfig } from '@nuxt/content'
import { z } from 'zod'
import * as S from './schemas'

/**
 * Une collection par fichier et par langue : `<nom>_fr`, `<nom>_en`.
 * Les fichiers-tableaux (avis, croqueurs, postes) sont exposés par @nuxt/content
 * sous la clé `body`.
 */
const LANGS = ['fr', 'en'] as const
const collections: Record<string, ReturnType<typeof defineCollection>> = {}

for (const l of LANGS) {
  collections[`produits_${l}`] = defineCollection({
    type: 'data',
    source: `${l}/produits/*.json`,
    schema: S.produitSchema,
  })
  collections[`recette_${l}`] = defineCollection({ type: 'data', source: `${l}/recette.json`, schema: S.recetteSchema })
  collections[`postes_${l}`] = defineCollection({
    type: 'data',
    source: `${l}/postes.json`,
    schema: z.object({ body: S.postesSchema }),
  })
  collections[`avis_${l}`] = defineCollection({
    type: 'data',
    source: `${l}/avis.json`,
    schema: z.object({ body: S.avisSchema }),
  })
  collections[`croqueurs_${l}`] = defineCollection({
    type: 'data',
    source: `${l}/croqueurs.json`,
    schema: z.object({ body: S.croqueursSchema }),
  })
  collections[`lieu_${l}`] = defineCollection({ type: 'data', source: `${l}/lieu.json`, schema: S.lieuSchema })
  collections[`contact_${l}`] = defineCollection({ type: 'data', source: `${l}/contact.json`, schema: S.contactSchema })
  collections[`site_${l}`] = defineCollection({ type: 'data', source: `${l}/site.json`, schema: S.siteSchema })
  collections[`ui_${l}`] = defineCollection({ type: 'data', source: `${l}/ui.json`, schema: S.uiSchema })
}

export default defineContentConfig({ collections })
