/**
 * Liste unique des « envies » autorisées (champ `envies` des produits).
 * Pour en ajouter une : l'ajouter ici + son libellé dans content/<lang>/ui.json › envies.
 */
export const ENVIES = ['croquant', 'fondant', 'sucre', 'fruite'] as const
export type Envie = (typeof ENVIES)[number]
