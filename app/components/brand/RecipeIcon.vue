<script setup lang="ts">
/** Icônes SVG animées des étapes de la recette. L'animation ne tourne que si `active` (section visible). */
defineProps<{ name: 'ingredients' | 'bol' | 'four' | 'sachet' | 'tricycle' | 'servir'; active?: boolean }>()
</script>

<template>
  <div class="icon" :class="{ active }" aria-hidden="true">
    <Tricycle v-if="name === 'tricycle'" :moving="active" class="h-full w-full" />
    <svg v-else viewBox="0 0 120 120" class="h-full w-full">
      <circle cx="60" cy="60" r="58" class="f-cream" />
      <g v-if="name === 'ingredients'">
        <path d="M30 104 Q28 68 60 64 Q92 68 90 104 Z" class="f-yellow" />
        <rect x="44" y="58" width="32" height="9" rx="4" class="f-red" />
        <g class="ear">
          <path d="M60 62 V16" class="s-blue" stroke-width="3" fill="none" />
          <ellipse cx="53" cy="30" rx="5" ry="10" transform="rotate(-24 53 30)" class="f-blue" />
          <ellipse cx="67" cy="30" rx="5" ry="10" transform="rotate(24 67 30)" class="f-blue" />
          <ellipse cx="53" cy="46" rx="5" ry="10" transform="rotate(-24 53 46)" class="f-blue" />
          <ellipse cx="67" cy="46" rx="5" ry="10" transform="rotate(24 67 46)" class="f-blue" />
        </g>
        <path class="drop" d="M96 34 Q106 50 96 58 Q86 50 96 34Z" style="fill: var(--ok-red)" />
      </g>
      <g v-else-if="name === 'bol'">
        <path d="M14 60 H106 Q106 108 60 108 Q14 108 14 60 Z" class="f-blue" />
        <ellipse cx="60" cy="60" rx="46" ry="11" class="f-yellow" />
        <g class="spoon">
          <rect x="57.5" y="10" width="6" height="52" rx="3" class="f-red" />
          <ellipse cx="60.5" cy="64" rx="8" ry="5.5" class="f-red" />
        </g>
        <circle class="splash" cx="30" cy="48" r="3" style="fill: var(--ok-yellow)" />
        <circle class="splash s2" cx="92" cy="46" r="3" style="fill: var(--ok-red)" />
      </g>
      <g v-else-if="name === 'four'">
        <rect x="14" y="24" width="92" height="82" rx="14" class="f-blue" />
        <rect x="24" y="46" width="72" height="46" rx="8" class="f-ink" />
        <rect class="glow" x="30" y="74" width="60" height="12" rx="6" style="fill: var(--ok-yellow)" />
        <circle cx="44" cy="68" r="7" class="f-cream" />
        <circle cx="62" cy="68" r="7" class="f-cream" />
        <circle cx="80" cy="68" r="7" class="f-cream" />
        <circle cx="30" cy="35" r="4" class="f-yellow" />
        <circle cx="44" cy="35" r="4" class="f-yellow" />
        <circle cx="58" cy="35" r="4" class="f-red" />
        <path
          class="steam"
          d="M70 22 q-5 -7 0 -14"
          fill="none"
          stroke-width="3"
          stroke-linecap="round"
          style="stroke: var(--ok-red)"
        />
        <path
          class="steam s2"
          d="M86 22 q-5 -7 0 -14"
          fill="none"
          stroke-width="3"
          stroke-linecap="round"
          style="stroke: var(--ok-red)"
        />
      </g>
      <g v-else-if="name === 'sachet'">
        <path class="bag" d="M32 34 H88 L92 100 Q60 108 28 100 Z" style="fill: var(--ok-blue)" />
        <rect x="30" y="64" width="60" height="10" class="f-red" />
        <text x="60" y="58" text-anchor="middle" font-size="20" class="font-display f-yellow">OK</text>
        <path class="seal f-red" d="M30 34 l5 -8 l5 8 l5 -8 l5 8 l5 -8 l5 8 l5 -8 l5 8 l5 -8 l5 8 l5 -8 l5 8 Z" />
      </g>
      <g v-else>
        <ellipse cx="60" cy="92" rx="46" ry="11" class="f-blue" />
        <circle cx="60" cy="62" r="30" class="f-yellow" />
        <circle cx="48" cy="54" r="4" class="f-red" />
        <circle cx="68" cy="50" r="4" class="f-red" />
        <circle cx="64" cy="72" r="4" class="f-red" />
        <circle cx="46" cy="72" r="3.5" class="f-red" />
        <path class="spark" d="M96 22 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3 Z" style="fill: var(--ok-red)" />
        <path class="spark s2" d="M22 32 l2 6 l6 2 l-6 2 l-2 6 l-2 -6 l-6 -2 l6 -2 Z" style="fill: var(--ok-blue)" />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.ear,
.spoon,
.drop,
.splash,
.steam,
.spark,
.bag,
.seal,
.glow {
  transform-box: fill-box;
  transform-origin: center;
}
.ear {
  transform-origin: 50% 100%;
}
.spoon {
  transform-origin: 50% 90%;
}
.active .ear {
  animation: sway 3.2s ease-in-out infinite;
}
.active .drop {
  animation: fall 2.4s ease-in infinite;
}
.active .spoon {
  animation: swirl 1.6s ease-in-out infinite;
}
.active .splash {
  animation: pop 1.6s ease-out infinite;
}
.active .splash.s2 {
  animation-delay: 0.6s;
}
.active .glow {
  animation: glow 1.8s ease-in-out infinite;
}
.active .steam {
  animation: rise 2.2s ease-out infinite;
}
.active .steam.s2 {
  animation-delay: 1s;
}
.active .seal {
  animation: seal 2.2s ease-in-out infinite;
}
.active .spark {
  animation: ok-pulse 1.6s ease-in-out infinite;
}
.active .spark.s2 {
  animation-delay: 0.7s;
}
@keyframes sway {
  50% {
    transform: rotate(6deg);
  }
  0%,
  100% {
    transform: rotate(-4deg);
  }
}
@keyframes fall {
  0% {
    transform: translateY(-4px);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  100% {
    transform: translateY(26px);
    opacity: 0;
  }
}
@keyframes swirl {
  0%,
  100% {
    transform: rotate(-24deg) translateX(-6px);
  }
  50% {
    transform: rotate(24deg) translateX(6px);
  }
}
@keyframes pop {
  0% {
    transform: scale(0.4) translateY(0);
    opacity: 0;
  }
  40% {
    opacity: 1;
  }
  100% {
    transform: scale(1) translateY(-14px);
    opacity: 0;
  }
}
@keyframes glow {
  50% {
    opacity: 0.35;
    transform: scaleX(0.9);
  }
}
@keyframes rise {
  0% {
    transform: translateY(8px);
    opacity: 0;
  }
  40% {
    opacity: 1;
  }
  100% {
    transform: translateY(-10px);
    opacity: 0;
  }
}
@keyframes seal {
  50% {
    transform: translateY(5px);
  }
}
</style>
