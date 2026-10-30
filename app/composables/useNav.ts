export function useNavLinks() {
  const { t } = useUi()
  const localePath = useLocalePath()
  const route = useRoute()
  const clean = (p: string) => (p.length > 1 ? p.replace(/\/$/, '') : p)
  const defs = [
    { to: '/', key: 'home' },
    { to: '/produits', key: 'products' },
    { to: '/recette', key: 'recipe' },
    { to: '/nous-trouver', key: 'find' },
    { to: '/team-bleue', key: 'team' },
    { to: '/ils-en-parlent', key: 'words' },
    { to: '/contact', key: 'contact' },
  ]
  const links = computed(() =>
    defs.map((d) => ({
      ...d,
      label: t(`nav.${d.key}`),
      path: localePath(d.to),
      active: clean(route.path) === clean(localePath(d.to)),
    })),
  )
  return { links }
}
