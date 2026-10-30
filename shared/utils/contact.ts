export interface ContactPayload {
  name: string
  email: string
  phone?: string
  message: string
  website?: string
  ts?: number
}

export function validateContact(p: Partial<ContactPayload>): { ok: true } | { ok: false; field: string } {
  const name = (p.name ?? '').trim()
  const email = (p.email ?? '').trim()
  const message = (p.message ?? '').trim()
  if (name.length < 2 || name.length > 120) return { ok: false, field: 'name' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 200) return { ok: false, field: 'email' }
  if ((p.phone ?? '').length > 40) return { ok: false, field: 'phone' }
  if (message.length < 5 || message.length > 4000) return { ok: false, field: 'message' }
  return { ok: true }
}

/** Limitation de débit en mémoire : `max` requêtes par fenêtre `windowMs` et par clé. */
export function createRateLimiter(max = 5, windowMs = 10 * 60 * 1000) {
  const hits = new Map<string, number[]>()
  return (key: string, now = Date.now()): boolean => {
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
    if (recent.length >= max) {
      hits.set(key, recent)
      return false
    }
    recent.push(now)
    hits.set(key, recent)
    if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k)
    return true
  }
}
