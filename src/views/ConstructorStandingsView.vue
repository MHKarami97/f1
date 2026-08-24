<script setup lang="ts">
import { useConstructorStandings } from '@/composables'
import ConstructorTable from '@/components/standings/ConstructorTable.vue'

const { standings, isLoading, error, retry } = useConstructorStandings(true)
</script>

<template>
  <div>
    <h1 class="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
      <span class="w-1.5 h-7 rounded-full bg-f1-red" />
      جدول امتیازات تیم‌ها
    </h1>
    <ConstructorTable :standings="standings" :is-loading="isLoading" :error="error" :on-retry="retry" />
  </div>
</template>