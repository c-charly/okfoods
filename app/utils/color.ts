/** Couleur de texte lisible (WCAG) sur un fond hexadécimal. Retourne un TOKEN, jamais une couleur en dur. */
export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.replace(/(.)/g, '$1$1') : h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(a: string, b: string): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (l1 + 0.05) / (l2 + 0.05)
}

// Valeurs des tokens --ok-white / --ok-ink, utilisées UNIQUEMENT pour calculer le contraste.
const WHITE = '#ffffff'
const INK = '#12154a'

export type Tone = 'light' | 'dark'
/** `light` = texte clair (blanc) sur fond sombre ; `dark` = texte foncé (ink) sur fond clair. */
export function toneOn(bg: string): Tone {
  return contrastRatio(bg, WHITE) >= contrastRatio(bg, INK) ? 'light' : 'dark'
}

export const toneVar = (tone: Tone) => (tone === 'light' ? 'var(--ok-white)' : 'var(--ok-ink)')
export const textOn = (bg: string) => toneVar(toneOn(bg))
