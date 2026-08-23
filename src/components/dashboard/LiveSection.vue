<script setup lang="ts">
import { useLiveSession } from '@/composables'
import LiveBadge from '@/components/ui/LiveBadge.vue'

const { isLive, activeSession } = useLiveSession()
</script>

<template>
  <div v-if="isLive" class="rounded-2xl border border-red-500/30 bg-red-500/5 p-6 mb-8">
    <div class="flex items-center gap-3 mb-4">
      <LiveBadge />
      <h2 class="text-gray-900 dark:text-white font-semibold">مسابقه در حال برگزاری</h2>
    </div>
    <p v-if="activeSession" class="text-gray-600 dark:text-gray-300 text-sm">
      {{ activeSession.session_name }} — {{ activeSession.location }}, {{ activeSession.country_name }}
    </p>
    <p class="text-gray-400 dark:text-gray-500 text-xs mt-2">داده\u200cها هر ۵ ثانیه به\u200cروز می\u200cشود</p>
  </div>
</template>
