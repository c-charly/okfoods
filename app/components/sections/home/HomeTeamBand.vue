<script setup lang="ts">
/** Accueil 6/6 — bandeau pleine largeur « Team bleue » : mots qui glissent, badge qui s'incline. */
const { t, raw } = useUi()
</script>

<template>
  <section class="relative overflow-hidden bg-ok-yellow py-14 text-ok-blue md:py-20" aria-labelledby="team-band">
    <MarqueeWords :words="raw('home.team.words') ?? []" :seconds="34" size="var(--step-giant)" />
    <div class="wrap mt-8 flex flex-col items-center gap-8 md:flex-row md:justify-between">
      <div
        class="team-badge anim-heavy grid h-44 w-44 shrink-0 place-items-center bg-ok-cream p-4 blob-b md:h-52 md:w-52"
        aria-hidden="true"
      >
        <Uniform class="h-full w-full" />
      </div>
      <div class="max-w-xl text-center md:text-left">
        <h2 id="team-band" class="sr-only">{{ t('nav.team') }}</h2>
        <p class="sub text-[clamp(1.4rem,3vw,2.2rem)]">{{ t('home.team.line') }}</p>
        <div class="mt-5">
          <Btn to="/team-bleue" variant="blue">{{ t('home.team.more') }} →</Btn>
        </div>
      </div>
    </div>
  </section>
</template>

<style>
.team-badge {
  transform: rotate(-7deg);
  animation: team-tilt 5s ease-in-out infinite;
}
@keyframes team-tilt {
  50% {
    transform: rotate(5deg) scale(1.03);
  }
}
html[data-motion='lite'] .team-badge {
  animation: none;
}
</style>
