<script setup lang="ts">

import { useRegisterSW } from 'virtual:pwa-register/vue'

const { needRefresh, updateServiceWorker } = useRegisterSW({
  onRegistered(registration) {
    // Polling pattern: check for a new SW build once per hour while the tab is open.
    if (registration) {
      setInterval(() => {
        registration.update().catch((err) => console.error('[UpdatePrompt] SW update check failed', err))
      }, 60 * 60 * 1000)
    }
  },
  onRegisterError(error) {
    console.error('[UpdatePrompt] Service Worker registration failed', error)
  },
})

function closePrompt(): void {
  needRefresh.value = false
}
</script>

<template>
  <!-- Teleport so this overlay is never clipped by an ancestor's overflow/transform. -->
  <Teleport to="body">
    <Transition name="fade-slide">
      <div
        v-if="needRefresh"
        dir="rtl"
        class="card fixed inset-x-4 bottom-6 z-100 mx-auto w-auto max-w-sm rounded-2xl p-4 shadow-2xl sm:inset-x-auto sm:right-6 sm:bottom-10 sm:w-90"
      >
        <div class="mb-4 text-center">
          <p class="text-13.5px font-medium leading-relaxed text-gray-900 dark:text-white">
            نسخهٔ جدیدی از اپلیکیشن در دسترس است!
          </p>
          <span class="text-11px text-gray-400 dark:text-gray-500">
            برای دریافت آخرین تغییرات، صفحه را به‌روزرسانی کنید.
          </span>
        </div>
        <div class="flex justify-center gap-3">
          <button
            type="button"
            class="rounded-lg bg-f1-red px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-f1-red-dark"
            @click="updateServiceWorker(true)"
          >
            به‌روزرسانی
          </button>
          <button
            type="button"
            class="rounded-lg border border-f1-light-border px-6 py-2 text-sm text-gray-700 transition-colors hover:bg-f1-light-surface-2 dark:border-f1-border dark:text-gray-300 dark:hover:bg-f1-surface-2"
            @click="closePrompt"
          >
            بعداً
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translate(0, 20px);
}
</style>
