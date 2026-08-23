import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore(
  'theme',
  () => {
    const isDark = ref(true)

    watch(
      isDark,
      (val) => {
        document.documentElement.classList.toggle('dark', val)
      },
      { immediate: true },
    )

    function toggle(): void {
      isDark.value = !isDark.value
    }

    return { isDark, toggle }
  },
  {
    persist: {
      key: 'f1-theme',
      storage: localStorage,
      pick: ['isDark'],
    },
  },
)
