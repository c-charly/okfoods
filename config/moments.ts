/** Moments de la journée (pause, croqueurs). Libellés dans ui.json › moments. */
export const MOMENTS = ['matin', 'midi', 'gouter', 'soir'] as const
export type Moment = (typeof MOMENTS)[number]
