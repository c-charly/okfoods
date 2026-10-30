/** Remplace {cle} dans un modèle (libellés d'interface). */
export function fmt(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => (k in vars ? String(vars[k]) : `{${k}}`))
}

/** Lien wa.me. Sans numéro valide, WhatsApp ouvre le sélecteur de contact (message prérempli quand même). */
export function buildWhatsAppLink(number: string | undefined, message: string): string {
  const digits = (number ?? '').replace(/\D/g, '')
  const text = encodeURIComponent(message)
  return digits ? `https://wa.me/${digits}?text=${text}` : `https://wa.me/?text=${text}`
}

export interface ApplyVars {
  prenom: string
  poste: string
  ville: string
  quartier: string
}
export function buildApplyMessage(template: string, v: ApplyVars): string {
  return fmt(template, { ...v })
}

export function buildMailto(to: string, subject: string, lines: string[]): string {
  const params = `subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`
  return `mailto:${to}?${params}`
}
