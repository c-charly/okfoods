export default defineNuxtPlugin((nuxtApp) => {
  // Après l'hydratation, pour ne pas provoquer de décalage serveur/client
  nuxtApp.hook('app:mounted', () => useEnvie().restore())
})
