<script setup lang="ts">
defineProps<{ rows?: number; height?: string }>()
</script>

<template>
  <div class="animate-pulse space-y-3">
    <div v-for="i in (rows ?? 5)" :key="i" :class="['rounded-lg bg-gray-200 dark:bg-f1-surface', height ?? 'h-10']" />
  </div>
</template>
