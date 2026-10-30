import type { gsap as Gsap } from 'gsap'
import type { ScrollTrigger as ST } from 'gsap/ScrollTrigger'

/**
 * GSAP + ScrollTrigger : import dynamique, côté client uniquement, une seule fois.
 * Chargé seulement par les composants qui s'animent (jamais sur les pages qui n'en ont pas besoin).
 */
let loading: Promise<{ gsap: typeof Gsap; ScrollTrigger: typeof ST }> | null = null

export function loadGsap() {
  loading ??= (async () => {
    const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
    gsap.registerPlugin(ScrollTrigger)
    return { gsap, ScrollTrigger }
  })()
  return loading
}
