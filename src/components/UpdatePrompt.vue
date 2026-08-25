<script setup lang="ts">
import { useRegisterSW } from "virtual:pwa-register/vue";

const { needRefresh, updateServiceWorker } = useRegisterSW({
  onRegistered(r) {
    // Polling Pattern: بررسی دوره‌ای آپدیت برای تب‌های باز طولانی‌مدت
    if (r) {
      setInterval(
        () => {
          r.update().catch((err) => {
            console.error("خطا در بررسی بروزرسانی Service Worker:", err);
          });
        },
        60 * 60 * 1000,
      ); // هر یک ساعت
    }
  },
  onRegisterError(error) {
    console.error("خطا در ثبت Service Worker:", error);
  },
});

// کپسوله‌سازی منطق بستن مودال
const closePrompt = () => {
  needRefresh.value = false;
};
</script>

<template>
  <!-- استفاده از Teleport یک Best Practice در Vue برای عناصر Fixed است -->
  <Teleport to="body">
    <Transition name="fade-slide">
      <div
        v-if="needRefresh"
        class="fixed bottom-6 left-1/2 z-[100] w-[90%] max-w-sm -translate-x-1/2 rounded-2xl border border-line/50 bg-paper p-4 shadow-2xl dark:border-night-line dark:bg-night sm:bottom-10"
        dir="rtl"
      >
        <div
          class="mb-4 text-center text-[13.5px] font-medium leading-relaxed text-ink dark:text-night-ink"
        >
          نسخه جدیدی آماده است!
          <br />
          <span class="text-[11px] text-ink-2 dark:text-night-ink-2">
            برای اعمال تغییرات، صفحه را بروزرسانی کنید.
          </span>
        </div>

        <div class="flex justify-center gap-3">
          <button
            @click="updateServiceWorker(true)"
            class="rounded-lg bg-blue-600 px-6 py-2 text-sm text-white transition hover:bg-blue-700"
          >
            بروزرسانی
          </button>
          <button
            @click="closePrompt"
            class="rounded-lg border border-gray-300 px-6 py-2 text-sm text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
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
  transform: translate(-50%, 20px);
}
</style>
