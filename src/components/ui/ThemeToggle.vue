<script setup lang="ts">
import { useTheme } from '@/composables'

const { isDark, toggle } = useTheme()
</script>

<template>
  <button
    class="relative p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-f1-light-surface-2 dark:hover:bg-f1-surface hover:text-f1-red transition-colors duration-300"
    :aria-label="isDark ? 'تغییر به حالت روشن' : 'تغییر به حالت تاریک'"
    @click="toggle"
  >
    <Transition name="theme-icon" mode="out-in">
      <svg v-if="isDark" key="sun" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="5" />
        <path stroke-linecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
      <svg v-else key="moon" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </svg>
    </Transition>
  </button>
</template>

<style scoped>
.theme-icon-enter-active,
.theme-icon-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.theme-icon-enter-from {
  opacity: 0;
  transform: rotate(-90deg) scale(0.6);
}
.theme-icon-leave-to {
  opacity: 0;
  transform: rotate(90deg) scale(0.6);
}
</style>