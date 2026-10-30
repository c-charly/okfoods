import { describe, expect, it } from 'vitest'
import { circleEdge, computeBitePositions, edgePointsFromRgba, silhouetteEdge } from '~/utils/bite'
import { buildApplyMessage, buildMailto, buildWhatsAppLink, fmt } from '~/utils/whatsapp'
import { isJobOpen, isPast } from '~/utils/dates'
import { deepMerge, mergeByKey } from '~/utils/merge'
import { fileName, initials, ratioValue, resolveImage } from '~/utils/images'
import { contrastRatio, textOn, toneOn } from '~/utils/color'
import { fitSize, wrapLines } from '~/utils/badge'
import { createRateLimiter, validateContact } from '../../shared/utils/contact'

describe('bite', () => {
  it('trouve le contour réel d’une image (disque opaque 20×20)', () => {
    const w = 20
    const rgba = new Uint8ClampedArray(w * w * 4)
    for (let y = 0; y < w; y++)
      for (let x = 0; x < w; x++) if (Math.hypot(x - 9.5, y - 9.5) < 8) rgba[(y * w + x) * 4 + 3] = 255
    const edge = edgePointsFromRgba(rgba, w, w)
    expect(edge.length).toBeGreaterThan(20)
    // tous les points du bord sont à ~8 px (=40 unités) du centre
    for (const p of edge) expect(Math.hypot(p.x - 50, p.y - 50)).toBeGreaterThan(30)
  })
  it('génère 3 niveaux de 3 cercles posés près du bord', () => {
    const levels = computeBitePositions(circleEdge(60, 40), 3, 1)
    expect(levels).toHaveLength(3)
    for (const lvl of levels) {
      expect(lvl).toHaveLength(3)
      for (const h of lvl) {
        expect(h.r).toBeGreaterThan(4)
        expect(Math.hypot(h.cx - 50, h.cy - 50)).toBeGreaterThan(25) // sur le contour, pas au centre
      }
    }
  })
  it('est déterministe pour une même graine et robuste sans contour', () => {
    expect(computeBitePositions(silhouetteEdge('sachet'), 3, 5)).toEqual(
      computeBitePositions(silhouetteEdge('sachet'), 3, 5),
    )
    expect(computeBitePositions([], 3)).toHaveLength(3)
  })
})

describe('whatsapp / mailto', () => {
  it('remplace les variables du message', () => {
    const msg = buildApplyMessage('Bonjour, je suis {prenom}, poste {poste} à {ville}, quartier {quartier}.', {
      prenom: 'A',
      poste: 'P',
      ville: 'V',
      quartier: 'Q',
    })
    expect(msg).toBe('Bonjour, je suis A, poste P à V, quartier Q.')
    expect(fmt('{x} {y}', { x: 1 })).toBe('1 {y}')
  })
  it('construit le lien wa.me avec ou sans numéro', () => {
    expect(buildWhatsAppLink('+237 6 12 34 56 78', 'Salut ça va')).toBe(
      'https://wa.me/237612345678?text=Salut%20%C3%A7a%20va',
    )
    expect(buildWhatsAppLink('', 'x')).toBe('https://wa.me/?text=x')
  })
  it('construit le mailto', () => {
    expect(buildMailto('a@b.cm', 'Sujet é', ['l1', 'l2'])).toBe('mailto:a@b.cm?subject=Sujet%20%C3%A9&body=l1%0Al2')
  })
})

describe('dates', () => {
  const now = new Date('2026-10-28T10:00:00').getTime()
  it('grise les postes dont la date est dépassée', () => {
    expect(isPast('2026-10-27', now)).toBe(true)
    expect(isPast('2026-10-28', now)).toBe(false) // valable toute la journée
    expect(isJobOpen({ actif: true, dateLimite: '2027-01-01' }, now)).toBe(true)
    expect(isJobOpen({ actif: false, dateLimite: '2027-01-01' }, now)).toBe(false)
    expect(isJobOpen({ actif: true, dateLimite: '2026-01-31' }, now)).toBe(false)
  })
})

describe('merge (repli EN → FR)', () => {
  it('fusionne en profondeur et garde le FR si la clé EN manque', () => {
    expect(deepMerge({ a: { b: 1, c: 2 }, d: 'fr' }, { a: { b: 9 } })).toEqual({ a: { b: 9, c: 2 }, d: 'fr' })
  })
  it('remplace par clé', () => {
    expect(
      mergeByKey(
        [
          { slug: 'x', n: 'fr' },
          { slug: 'y', n: 'fr' },
        ],
        [{ slug: 'y', n: 'en' }],
        'slug',
      ),
    ).toEqual([
      { slug: 'x', n: 'fr' },
      { slug: 'y', n: 'en' },
    ])
  })
})

describe('images', () => {
  const idx = ['/images/croqueurs/croqueur-01.webp', '/images/produits/a.png']
  it('résout un fichier présent, même avec une autre extension', () => {
    expect(resolveImage('/images/produits/a.png', idx)).toBe('/images/produits/a.png')
    expect(resolveImage('/images/croqueurs/croqueur-01.jpg', idx)).toBe('/images/croqueurs/croqueur-01.webp')
    expect(resolveImage('/images/croqueurs/croqueur-02.jpg', idx)).toBeNull()
    expect(resolveImage(undefined, idx)).toBeNull()
  })
  it('utilitaires', () => {
    expect(fileName('/a/b/c.jpg')).toBe('c.jpg')
    expect(initials('Prénom A')).toBe('PA')
    expect(ratioValue('4:5')).toBe(0.8)
    expect(ratioValue('libre')).toBeNull()
  })
})

describe('contraste', () => {
  it('choisit un texte lisible', () => {
    expect(toneOn('#2C3691')).toBe('light')
    expect(toneOn('#F8EF22')).toBe('dark')
    expect(textOn('#B8121A')).toBe('var(--ok-white)')
    expect(contrastRatio('#ffffff', '#2C3691')).toBeGreaterThan(7)
  })
})

describe('contact', () => {
  it('valide les champs', () => {
    expect(validateContact({ name: 'Al', email: 'a@b.cm', message: 'Bonjour !' })).toEqual({ ok: true })
    expect(validateContact({ name: 'Al', email: 'nope', message: 'Bonjour !' })).toEqual({ ok: false, field: 'email' })
    expect(validateContact({ name: '', email: 'a@b.cm', message: 'Bonjour !' })).toEqual({ ok: false, field: 'name' })
  })
  it('limite le débit', () => {
    const ok = createRateLimiter(2, 1000)
    expect([ok('ip', 0), ok('ip', 1), ok('ip', 2), ok('ip', 1500)]).toEqual([true, true, false, true])
  })
})

describe('badge', () => {
  const measure = (t: string) => t.length * 10
  it('découpe le poste en 2 lignes max', () => {
    expect(wrapLines(measure, 'Vendeur ambulant de quartier', 150, 2)).toEqual(['Vendeur', 'ambulant…'])
    expect(wrapLines(measure, 'Court', 150)).toEqual(['Court'])
    expect(wrapLines(measure, 'un deux trois quatre cinq six sept', 80, 2)).toHaveLength(2)
  })
  it('ajuste la taille de police', () => {
    expect(fitSize((s, t) => t.length * s * 0.5, 'ABCDEFGHIJ', 400, 200, 40)).toBeLessThanOrEqual(80)
    expect(fitSize((s, t) => t.length * s * 0.5, 'AB', 400, 200, 40)).toBe(200)
  })
})
