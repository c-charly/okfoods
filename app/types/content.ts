import type * as S from '~~/schemas'
import type { z } from 'zod'

export type Produit = z.infer<typeof S.produitSchema>
export type Etape = z.infer<typeof S.etapeSchema>
export type Recette = z.infer<typeof S.recetteSchema>
export type Poste = z.infer<typeof S.posteItem>
export type Avis = z.infer<typeof S.avisItem>
export type Croqueur = z.infer<typeof S.croqueurItem>
export type Lieu = z.infer<typeof S.lieuSchema>
export type Site = z.infer<typeof S.siteSchema>
export type ContactFlow = z.infer<typeof S.contactSchema>
export type ManifestEntry = z.infer<typeof S.imageManifestSchema>['images'][number]
export type Dict = Record<string, any>
