<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  src: string | null
  name: string
  teamColour: string
  sizeClass?: string
  roundClass?: string
  textClass?: string
}>()

const failed = ref(false)
watch(() => props.src, () => {
  failed.value = false
})

const showFallback = computed(() => !props.src || failed.value)

const initials = computed(() => {
  const parts = props.name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  return props.name.slice(0, 2).toUpperCase()
})
</script>

<template>
  <img
    v-if="!showFallback"
    :src="src as string"
    :alt="name"
    :class="['object-cover flex-shrink-0 border border-f1-light-border dark:border-f1-border', sizeClass ?? 'w-8 h-8', roundClass ?? 'rounded-full']"
    loading="lazy"
    @error="failed = true"
  />
  <div
    v-else
    :class="['flex items-center justify-center flex-shrink-0 font-bold text-white', sizeClass ?? 'w-8 h-8', roundClass ?? 'rounded-full', textClass ?? 'text-xs']"
    :style="{ backgroundColor: `#${teamColour}` }"
  >
    {{ initials }}
  </div>
</template>