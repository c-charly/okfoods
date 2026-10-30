/** Une date limite (AAAA-MM-JJ) est dépassée une fois la journée terminée (heure locale). */
export function isPast(dateStr: string, now: number = Date.now()): boolean {
  const end = new Date(`${dateStr}T23:59:59`)
  return Number.isNaN(end.getTime()) ? false : now > end.getTime()
}

export interface JobLike {
  actif: boolean
  dateLimite: string
}
export function isJobOpen(job: JobLike, now: number = Date.now()): boolean {
  return job.actif && !isPast(job.dateLimite, now)
}

export function formatDate(dateStr: string, locale: string): string {
  const d = new Date(`${dateStr}T12:00:00`)
  return Number.isNaN(d.getTime())
    ? dateStr
    : new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'fr-FR', { dateStyle: 'long' }).format(d)
}
