/**
 * Dégradation automatique des animations — 3 états : full (desktop), lite (mobile / appareil lent), static (reduced-motion).
 * Le bouton « Réduire les animations » force `static` et mémorise le choix.
 */
export type MotionMode = 'full' | 'lite' | 'static'
const STORAGE_KEY = 'okfoods:reduce-motion'

export function useMotion() {
  const osReduced = useState('motion-os-reduced', () => false)
  const userReduced = useState('motion-user-reduced', () => false)
  const saveData = useState('motion-save-data', () => false)
  const lowSpec = useState('motion-low-spec', () => false)
  const lowFps = useState('motion-low-fps', () => false)
  const isMobile = useState('motion-mobile', () => false)
  const finePointer = useState('motion-fine-pointer', () => false)

  const mode = computed<MotionMode>(() => {
    if (osReduced.value || userReduced.value) return 'static'
    if (isMobile.value || saveData.value || lowSpec.value || lowFps.value) return 'lite'
    return 'full'
  })

  function toggleReduced() {
    userReduced.value = !userReduced.value
    try {
      localStorage.setItem(STORAGE_KEY, userReduced.value ? '1' : '0')
    } catch {
      /* stockage indisponible */
    }
  }

  /** À appeler une seule fois, côté client (plugin motion.client.ts). */
  function init() {
    const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    const mqMobile = window.matchMedia('(max-width: 767px), (pointer: coarse)')
    const mqFine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const nav = navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string }
      deviceMemory?: number
    }

    const read = () => {
      osReduced.value = mqReduce.matches
      isMobile.value = mqMobile.matches
      finePointer.value = mqFine.matches
    }
    read()
    for (const mq of [mqReduce, mqMobile, mqFine]) mq.addEventListener('change', read)

    try {
      userReduced.value = localStorage.getItem(STORAGE_KEY) === '1'
    } catch {
      /* ignore */
    }
    const conn = nav.connection
    saveData.value = conn?.saveData === true || ['2g', 'slow-2g'].includes(conn?.effectiveType ?? '')
    lowSpec.value =
      (nav.deviceMemory !== undefined && nav.deviceMemory <= 2) ||
      (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency <= 2)

    // Mise en page : décidée UNE fois au chargement (sections hautes + contenu collant seulement en mode complet).
    // La sonde de fluidité ne la modifie jamais en cours de visite (pas de saut de page) ; seul le choix
    // volontaire « Réduire les animations » aplatit la mise en page.
    const root = document.documentElement
    root.dataset.layout = mode.value === 'full' ? 'tall' : 'flat'
    watchEffect(() => {
      root.dataset.motion = mode.value
      if (mode.value === 'static') root.dataset.layout = 'flat'
    })

    // Mesure du framerate sur les premières secondes : sous ≈ 30 fps → mode allégé
    if (mode.value !== 'static') {
      let frames = 0
      let start = 0
      const probe = (t: number) => {
        if (!start) start = t
        if (t - start < 500) {
          requestAnimationFrame(probe)
          return
        } // échauffement
        frames++
        if (t - start < 3000) {
          requestAnimationFrame(probe)
          return
        }
        const fps = (frames / (t - start - 500)) * 1000
        if (fps < 30) lowFps.value = true
      }
      requestAnimationFrame(probe)
    }
  }

  /** Vrai si la mise en page « haute » (défilement piloté) a été retenue au chargement. */
  const isTall = () => import.meta.client && document.documentElement.dataset.layout === 'tall'

  return {
    mode,
    init,
    toggleReduced,
    isTall,
    userReduced,
    isMobile,
    finePointer,
    isStatic: computed(() => mode.value === 'static'),
    isFull: computed(() => mode.value === 'full'),
    isLite: computed(() => mode.value === 'lite'),
  }
}
