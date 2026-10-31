/** Badge candidat : dessin canvas 1080x1350 (4:5), entièrement côté appareil. */
export const BADGE_W = 1080
export const BADGE_H = 1350

export type Measure = (text: string) => number

/** Découpe un texte en lignes qui tiennent dans `maxW` (retourne au plus `maxLines`, dernière ligne tronquée par " ... "). */
export function wrapLines(measure: Measure, text: string, maxW: number, maxLines = 2): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w
    if (measure(next) <= maxW || !cur) cur = next
    else {
      lines.push(cur)
      cur = w
    }
  }
  if (cur) lines.push(cur)
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines)
    kept[maxLines - 1] = `${kept[maxLines - 1]!.replace(/\s+\S*$/, '')}...`
    return kept
  }
  return lines
}

/** Plus grande taille de police <= `start` (par pas de 4) pour laquelle le texte tient dans `maxW`. */
export function fitSize(
  measureAt: (size: number, text: string) => number,
  text: string,
  maxW: number,
  start: number,
  min: number,
): number {
  let size = start
  while (size > min && measureAt(size, text) > maxW) size -= 4
  return size
}

export interface BadgeInput {
  prenom: string
  poste: string
  ville: string
  quartier: string
  label: string
}
export interface BadgeTheme {
  blue: string
  blueDeep: string
  red: string
  yellow: string
  cream: string
  white: string
  display: string
  sans: string
}

export async function drawBadge(
  canvas: HTMLCanvasElement,
  input: BadgeInput,
  theme: BadgeTheme,
  logo: HTMLImageElement | null,
): Promise<void> {
  canvas.width = BADGE_W
  canvas.height = BADGE_H
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas indisponible')
  const pad = 90
  const maxW = BADGE_W - pad * 2

  ctx.fillStyle = theme.blue
  ctx.fillRect(0, 0, BADGE_W, BADGE_H)
  // " Morsures " décoratives
  const dot = (x: number, y: number, r: number, c: string) => {
    ctx.fillStyle = c
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
  dot(BADGE_W - 70, 40, 230, theme.yellow)
  dot(-40, BADGE_H - 20, 260, theme.red)
  dot(BADGE_W - 160, BADGE_H - 330, 70, theme.blueDeep)
  dot(180, 360, 36, theme.blueDeep)

  // En-tête : logo réel ou mot-symbole de repli
  if (logo && logo.naturalWidth) {
    const h = 120
    const w = Math.min(420, (logo.naturalWidth / logo.naturalHeight) * h)
    ctx.drawImage(logo, pad, 90, w, h)
  } else {
    ctx.fillStyle = theme.white
    ctx.font = `110px ${theme.display}`
    ctx.textBaseline = 'alphabetic'
    ctx.fillText('OK Foods', pad, 190)
  }

  // Prénom (taille ajustée à la largeur)
  const prenom = (input.prenom.trim() || '...').toUpperCase()
  const size = fitSize(
    (s, t) => {
      ctx.font = `${s}px ${theme.display}`
      return ctx.measureText(t).width
    },
    prenom,
    maxW,
    230,
    80,
  )
  ctx.font = `${size}px ${theme.display}`
  ctx.fillStyle = theme.white
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(prenom, pad, 560)

  // Poste (2 lignes max)
  ctx.font = `700 60px ${theme.sans}`
  ctx.fillStyle = theme.yellow
  const jobLines = wrapLines((t) => ctx.measureText(t).width, input.poste.trim() || '-', maxW, 2)
  jobLines.forEach((l, i) => ctx.fillText(l, pad, 680 + i * 74))

  // Ville - quartier
  ctx.font = `600 50px ${theme.sans}`
  ctx.fillStyle = theme.cream
  const where = [input.ville.trim(), input.quartier.trim()].filter(Boolean).join(', ')
  if (where) ctx.fillText(where, pad, 680 + jobLines.length * 74 + 40)

  // Pastille " CANDIDAT "
  const bw = 640
  const bh = 150
  const bx = (BADGE_W - bw) / 2
  const by = BADGE_H - 300
  ctx.fillStyle = theme.red
  ctx.beginPath()
  ctx.roundRect(bx, by, bw, bh, bh / 2)
  ctx.fill()
  ctx.fillStyle = theme.white
  ctx.font = `84px ${theme.display}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(input.label, BADGE_W / 2, by + bh / 2 + 6)
  ctx.textAlign = 'left'
}
