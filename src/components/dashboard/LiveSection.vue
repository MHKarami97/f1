<script setup lang="ts">
import { useLiveSession } from '@/composables'
import LiveBadge from '@/components/ui/LiveBadge.vue'

const { isLive, activeSession } = useLiveSession()
</script>

<template>
  <div v-if="isLive" class="glow-red stripe-top relative overflow-hidden rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-500/10 to-transparent p-6 mb-8">
    <div class="absolute -top-8 -left-8 w-32 h-32 bg-red-500/10 rounded-full blur-3xl" />
    <div class="relative flex items-center gap-3 mb-4">
      <LiveBadge />
      <h2 class="text-gray-900 dark:text-white font-semibold">مسابقه در حال برگزاری</h2>
    </div>
    <p v-if="activeSession" class="relative text-gray-600 dark:text-gray-300 text-sm">
      {{ activeSession.session_name }} — {{ activeSession.location }}, {{ activeSession.country_name }}
    </p>
    <p class="relative text-gray-400 dark:text-gray-500 text-xs mt-2">داده‌ها هر ۵ ثانیه به‌روز می‌شود</p>
  </div>
</template>