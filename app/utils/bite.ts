/**
 * Morsures : calcul des positions à partir du CONTOUR RÉEL d'une image (pixels non transparents),
 * coordonnées normalisées dans un repère 0–100 (viewBox du masque SVG).
 */
export interface Pt {
  x: number
  y: number
}
export interface Hole {
  cx: number
  cy: number
  r: number
}

export function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Pixels d'ALPHA (RGBA → on lit 1 valeur sur 4) → points du bord, normalisés 0–100. */
export function edgePointsFromRgba(rgba: ArrayLike<number>, w: number, h: number, threshold = 40): Pt[] {
  const solid = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < w && y < h && (rgba[(y * w + x) * 4 + 3] ?? 0) > threshold
  const out: Pt[] = []
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!solid(x, y)) continue
      if (!solid(x - 1, y) || !solid(x + 1, y) || !solid(x, y - 1) || !solid(x, y + 1)) {
        out.push({ x: ((x + 0.5) / w) * 100, y: ((y + 0.5) / h) * 100 })
      }
    }
  }
  return out
}

export function circleEdge(n = 48, r = 40, cx = 50, cy = 50): Pt[] {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r }
  })
}

export function rectEdge(x0: number, y0: number, x1: number, y1: number, step = 4): Pt[] {
  const pts: Pt[] = []
  for (let x = x0; x <= x1; x += step) pts.push({ x, y: y0 }, { x, y: y1 })
  for (let y = y0; y <= y1; y += step) pts.push({ x: x0, y }, { x: x1, y })
  return pts
}

/** Contours analytiques des silhouettes de repli (même repère que ProductSilhouette). */
export function silhouetteEdge(kind: 'biscuit' | 'sachet' | 'bonbon'): Pt[] {
  if (kind === 'sachet') return rectEdge(26, 10, 74, 90)
  if (kind === 'bonbon') return circleEdge(48, 30, 50, 50).map((p) => ({ x: 50 + (p.x - 50) * 1.35, y: p.y }))
  return circleEdge(48, 40)
}

/** Angles cibles (radians) des 3 bouchées : haut-droite, gauche, bas-droite. */
const TARGETS = [-Math.PI / 4, Math.PI * 0.95, Math.PI / 3]

/**
 * 3 niveaux de morsure ; chaque niveau = 3 cercles qui « rongent » le bord (aspect denté).
 * Les centres sont posés SUR le contour réel, légèrement vers l'intérieur.
 */
export function computeBitePositions(edge: Pt[], levels = 3, seed = 7): Hole[][] {
  const pts = edge.length >= 8 ? edge : circleEdge()
  const rand = mulberry32(seed)
  const c = pts.reduce((a, p) => ({ x: a.x + p.x / pts.length, y: a.y + p.y / pts.length }), { x: 0, y: 0 })
  const radius = Math.max(...pts.map((p) => Math.hypot(p.x - c.x, p.y - c.y)), 1)
  const R = Math.min(Math.max(radius * 0.3, 7), 18)
  const angleOf = (p: Pt) => Math.atan2(p.y - c.y, p.x - c.x)
  const diff = (a: number, b: number) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)))

  return Array.from({ length: levels }, (_, i) => {
    const target = (TARGETS[i % TARGETS.length] ?? 0) + (rand() - 0.5) * 0.5
    // Parmi les points du bord les plus éloignés du centre, on garde le plus proche de l'angle visé
    let best = pts[0]!
    let bestScore = Infinity
    for (const p of pts) {
      const dist = Math.hypot(p.x - c.x, p.y - c.y)
      const score = diff(angleOf(p), target) * 10 + (radius - dist) * 0.15
      if (score < bestScore) {
        bestScore = score
        best = p
      }
    }
    const a = angleOf(best)
    // Point d'ancrage poussé vers l'intérieur
    const ax = best.x - Math.cos(a) * R * 0.35
    const ay = best.y - Math.sin(a) * R * 0.35
    // 3 cercles étalés le long de la tangente
    const tx = -Math.sin(a)
    const ty = Math.cos(a)
    return [-1, 0, 1].map((k) => ({
      cx: round(ax + tx * k * R * 0.95),
      cy: round(ay + ty * k * R * 0.95),
      r: round(k === 0 ? R : R * 0.78),
    }))
  })
}

const round = (n: number) => Math.round(n * 100) / 100
