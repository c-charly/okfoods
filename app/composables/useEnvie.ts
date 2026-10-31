import type { Envie } from '~~/config/envies'
import type { Moment } from '~~/config/moments'

const KEY = 'okfoods:envie'

/** État partagé " envie " + " moment " choisis sur l'accueil, réutilisé sur /produits. */
export function useEnvie() {
  const envie = useState<Envie | null>('envie', () => null)
  const moment = useState<Moment | null>('moment', () => null)

  function persist() {
    try {
      localStorage.setItem(KEY, JSON.stringify({ envie: envie.value, moment: moment.value }))
    } catch {
      /* ignore */
    }
  }
  function setEnvie(e: Envie | null) {
    envie.value = e
    persist()
  }
  function setMoment(m: Moment | null) {
    moment.value = m
    persist()
  }
  function restore() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null')
      if (saved) {
        envie.value = saved.envie ?? null
        moment.value = saved.moment ?? null
      }
    } catch {
      /* ignore */
    }
  }
  return { envie, moment, setEnvie, setMoment, restore }
}
