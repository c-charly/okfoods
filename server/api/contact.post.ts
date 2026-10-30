/**
 * POST /api/contact — validation serveur, champ piège, délai minimum, limite de débit (en mémoire).
 * SMTP configuré (NUXT_SMTP_*, NUXT_CONTACT_TO) → e-mail envoyé. Sinon : journalisé, succès « démo ».
 */
const limiter = createRateLimiter(5, 10 * 60 * 1000)

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<ContactPayload>>(event).catch(() => ({}) as Partial<ContactPayload>)
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'

  // Robots : champ piège rempli ou formulaire envoyé en moins de 2 s → on répond « ok » sans rien faire
  const tooFast = typeof body.ts === 'number' && body.ts > 0 && Date.now() - body.ts < 2000
  if (body.website || tooFast) return { ok: true }

  if (!limiter(ip)) throw createError({ statusCode: 429, statusMessage: 'Too Many Requests' })

  const check = validateContact(body)
  if (!check.ok) throw createError({ statusCode: 400, statusMessage: 'Invalid field', data: { field: check.field } })

  const cfg = useRuntimeConfig(event)
  const subject = `[OK Foods] Message de ${String(body.name).trim().slice(0, 80)}`
  const text = `Nom : ${body.name}\nE-mail : ${body.email}\nTéléphone : ${body.phone || '—'}\n\n${body.message}`

  if (!cfg.smtp.host || !cfg.contactTo) {
    console.info('[contact:demo] SMTP non configuré — message enregistré dans les journaux uniquement', {
      subject,
      from: body.email,
    })
    return { ok: true, demo: true }
  }

  try {
    const nodemailer = await import('nodemailer')
    const transport = nodemailer.createTransport({
      host: cfg.smtp.host,
      port: Number(cfg.smtp.port) || 587,
      secure: String(cfg.smtp.secure) === 'true',
      auth: cfg.smtp.user ? { user: cfg.smtp.user, pass: cfg.smtp.pass } : undefined,
    })
    await transport.sendMail({
      from: cfg.contactFrom || cfg.smtp.user || cfg.contactTo,
      to: cfg.contactTo,
      replyTo: String(body.email),
      subject,
      text,
    })
    return { ok: true }
  } catch (err) {
    console.error('[contact] échec d’envoi SMTP', err)
    throw createError({ statusCode: 502, statusMessage: 'Mail error' })
  }
})
