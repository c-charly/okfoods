import { z } from 'zod'
import { ENVIES } from '../config/envies'
import { MOMENTS } from '../config/moments'

/**
 * Schémas de validation de TOUS les contenus.
 * Utilisés par `content.config.ts` (typage @nuxt/content) ET par le module
 * `modules/okfoods.ts` qui fait échouer le build si une donnée est invalide.
 */
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Couleur hexadécimale attendue (#RRGGBB)')
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date attendue au format AAAA-MM-JJ')
const placeholder = z.boolean().default(false)
const rec = z.record(z.string(), z.any())

export const produitSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, 'slug en minuscules, chiffres et tirets'),
  name: z.string().min(1),
  range: z.string(),
  envies: z.array(z.enum(ENVIES)).min(1),
  color: hex,
  accentColor: hex,
  crumbColor: hex,
  image: z.string().optional(),
  kind: z.enum(['biscuit', 'sachet', 'bonbon']).default('biscuit'),
  format: z.string(),
  flavors: z.array(z.string()),
  description: z.string(),
  tagline: z.string(),
  moments: z.array(z.enum(MOMENTS)).optional(),
  order: z.number(),
  placeholder,
})

export const etapeSchema = z.object({
  n: z.number().int().positive(),
  titre: z.string(),
  texte: z.string(),
  chiffre: z.string(),
  icone: z.enum(['ingredients', 'bol', 'four', 'sachet', 'tricycle', 'servir']),
  image: z.string().optional(),
  placeholder,
})

export const recetteSchema = z.object({
  intro: z.string().optional(),
  steps: z.array(etapeSchema).min(3).max(8),
  reperes: z
    .array(z.object({ valeur: z.string(), label: z.string(), placeholder }))
    .min(3)
    .max(5),
  engagement: z.object({ titre: z.string(), texte: z.string() }).optional(),
})

export const posteItem = z.object({
  id: z.string(),
  intitule: z.string(),
  ville: z.string(),
  profil: z.string(),
  dateLimite: date,
  datePublication: date.optional(),
  actif: z.boolean(),
  placeholder,
})
export const postesSchema = z.array(posteItem)

export const avisItem = z.object({
  completion: z.string(),
  prenom: z.string(),
  ville: z.string(),
  placeholder,
})
export const avisSchema = z.array(avisItem).min(1)

export const croqueurItem = z.object({
  id: z.string(),
  prenom: z.string(),
  ville: z.string(),
  phrase: z.string(),
  moment: z.enum(MOMENTS),
  produit: z.string(),
  image: z.string().optional(),
  alt: z.string(),
  format: z.enum(['portrait', 'paysage', 'carre']).default('portrait'),
  enAvant: z.boolean().default(false),
  consentement: z.boolean().default(false),
  placeholder,
})
export const croqueursSchema = z.array(croqueurItem).min(3).max(24)

export const lieuSchema = z.object({
  nom: z.string(),
  nature: z.string(),
  adresse: z.string(),
  telephone: z.string(),
  email: z.string(),
  horaires: z.string(),
  mapsUrl: z.string(),
  mapsEmbedUrl: z.string().optional(),
  gps: z.object({ lat: z.number(), lng: z.number() }).optional(),
  placeholder,
})

export const siteSchema = z.object({
  nom: z.string(),
  slogan: z.string(),
  social: z.array(z.object({ name: z.string(), url: z.string() })),
  whatsappRecrutement: z.string(),
  emailContact: z.string(),
  legal: z.object({
    mentions: z.object({ title: z.string(), paragraphs: z.array(z.string()) }),
    confidentialite: z.object({ title: z.string(), paragraphs: z.array(z.string()) }),
  }),
  placeholder,
})

export const contactStep = z.object({
  id: z.string(),
  question: z.string(),
  type: z.enum(['choice', 'text']),
  options: z.array(z.string()).optional(),
})
export const contactSchema = z.object({
  intro: z.string(),
  outro: z.string(),
  profils: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        subject: z.string(),
        redirect: z.string().optional(),
        steps: z.array(contactStep),
      }),
    )
    .min(1),
})

export const uiSchema = z.object({
  a11y: rec,
  nav: rec,
  cta: rec,
  motion: rec,
  lang: rec,
  placeholder: rec,
  footer: rec,
  seo: rec,
  envies: rec,
  moments: rec,
  home: rec,
  produits: rec,
  recette: rec,
  trouver: rec,
  team: rec,
  parole: rec,
  contact: rec,
  notFound: rec,
})

export const imageManifestSchema = z.object({
  images: z.array(
    z.object({
      id: z.string(),
      path: z.string(),
      ratio: z.string(),
      minWidth: z.number(),
      minHeight: z.number(),
      description: z.string(),
      required: z.boolean(),
    }),
  ),
})
