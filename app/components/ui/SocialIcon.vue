<script setup lang="ts">
/** Icones des reseaux sociaux (SVG en traits). Le nom vient de site.json (social[].name), insensible a la casse. */
const props = defineProps<{ name: string }>()
const kind = computed(() => {
  const n = props.name.toLowerCase()
  if (n.includes('facebook')) return 'facebook'
  if (n.includes('instagram')) return 'instagram'
  if (n.includes('tiktok')) return 'tiktok'
  if (n.includes('youtube')) return 'youtube'
  if (n.includes('whatsapp')) return 'whatsapp'
  if (n.includes('linkedin')) return 'linkedin'
  if (n.includes('telegram')) return 'telegram'
  if (n === 'x' || n.includes('twitter')) return 'x'
  return 'link'
})
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    class="h-6 w-6"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path
      v-if="kind === 'facebook'"
      d="M14.500 3.500h-2A4.500 4.500 0 0 0 8 8v2.500H5.500V14H8v7h3.800v-7h2.700l.7-3.500h-3.400V8.500c0-.6.4-1 1-1h1.700Z"
    />
    <template v-else-if="kind === 'instagram'">
      <rect x="3.500" y="3.500" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r=".6" fill="currentColor" />
    </template>
    <template v-else-if="kind === 'tiktok'">
      <path d="M14 4v10.500a3.500 3.500 0 1 1-3.500-3.500" />
      <path d="M14 4c.4 2.600 2 4.100 4.500 4.300" />
    </template>
    <template v-else-if="kind === 'youtube'">
      <rect x="2.500" y="5.500" width="19" height="13" rx="4" />
      <path d="M10 9v6l5-3Z" fill="currentColor" />
    </template>
    <template v-else-if="kind === 'whatsapp'">
      <path d="M12 3.500a8.500 8.500 0 0 0-7.300 12.800L3.500 20.500l4.300-1.100A8.500 8.500 0 1 0 12 3.500Z" />
      <path
        d="M9.200 8.600c0 3.200 3 6.200 6.200 6.200l1.200-1.300-2-1.100-.9.900c-1.200-.5-2.200-1.500-2.700-2.700l.9-.9-1.100-2Z"
      />
    </template>
    <template v-else-if="kind === 'linkedin'">
      <path d="M6 9.500V19M6 5.500v.1M10.500 19V9.500M10.500 13a3.500 3.500 0 0 1 7 0V19" />
    </template>
    <path v-else-if="kind === 'telegram'" d="M21 4 3 11l6 2.500L11.500 20l2.500-4 5 3.500L21 4ZM9 13.500 21 4" />
    <path v-else-if="kind === 'x'" d="M4 4l16 16M20 4 4 20" />
    <template v-else>
      <path d="M10 14a4 4 0 0 0 5.700 0l3-3a4 4 0 0 0-5.700-5.700l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.700 0l-3 3a4 4 0 0 0 5.700 5.700l1-1" />
    </template>
  </svg>
</template>
