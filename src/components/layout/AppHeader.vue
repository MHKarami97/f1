<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import ThemeToggle from '@/components/ui/ThemeToggle.vue'

const { t } = useI18n()
const route = useRoute()
const mobileMenuOpen = ref(false)

const navItems = [
  { name: t('nav.home'), to: '/' },
  { name: t('nav.drivers'), to: '/drivers' },
  { name: t('nav.teams'), to: '/teams' },
  { name: t('nav.calendar'), to: '/calendar' },
]
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-gray-200 dark:border-f1-border bg-white/95 dark:bg-f1-dark/95 backdrop-blur-md transition-colors">
    <div class="container mx-auto px-4 max-w-7xl">
      <div class="flex items-center justify-between h-16">
        <RouterLink to="/" class="flex items-center gap-2">
          <span class="text-f1-red font-bold text-2xl tracking-tight">F1</span>
          <span class="text-sm font-medium text-gray-500 dark:text-gray-400">ایران</span>
        </RouterLink>

        <nav class="hidden md:flex items-center gap-6">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            :class="[
              'text-sm font-medium transition-colors hover:text-f1-red',
              route.path === item.to ? 'text-f1-red' : 'text-gray-600 dark:text-gray-300',
            ]"
          >
            {{ item.name }}
          </RouterLink>
        </nav>

        <div class="flex items-center gap-3">
          <ThemeToggle />
          <button
            class="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-f1-surface transition-colors"
            aria-label="منو"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div v-if="mobileMenuOpen" class="md:hidden py-4 border-t border-gray-200 dark:border-f1-border space-y-1">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="block py-2 text-sm font-medium hover:text-f1-red transition-colors"
          @click="mobileMenuOpen = false"
        >
          {{ item.name }}
        </RouterLink>
      </div>
    </div>
  </header>
</template>
