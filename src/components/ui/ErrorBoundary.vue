<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{ message?: string; onRetry?: () => void }>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 gap-4 text-center">
    <svg class="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
    <p class="text-gray-500 dark:text-gray-400 text-sm">{{ message ?? t('errors.dataUnavailable') }}</p>
    <button v-if="onRetry" class="px-4 py-2 rounded-lg bg-f1-red text-white text-sm hover:bg-red-700 transition-colors" @click="onRetry">
      {{ t('errors.tryAgain') }}
    </button>
  </div>
</template>
