<script setup lang="ts">
import { useThemeStore } from '@/stores'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'

const themeStore = useThemeStore()
</script>

<template>
  <div :class="['min-h-screen flex flex-col bg-white dark:bg-f1-dark transition-colors', themeStore.isDark ? 'dark' : '']">
    <AppHeader />
    <main class="flex-1 container mx-auto px-4 py-6 max-w-7xl">
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>
