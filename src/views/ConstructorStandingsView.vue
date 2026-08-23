<script setup lang="ts">
import { useConstructorStandings } from '@/composables'
import ConstructorTable from '@/components/standings/ConstructorTable.vue'

const { standings, isLoading, error, retry } = useConstructorStandings(true)
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">جدول امتیازات تیم\u200cها</h1>
    <ConstructorTable :standings="standings" :is-loading="isLoading" :error="error" :on-retry="retry" />
  </div>
</template>
