import { computed } from 'vue'
import { useThemeStore } from '@/stores/themeStore'

export function useTheme() {
  const store = useThemeStore()
  const isDark = computed(() => store.isDark)

  return {
    isDark,
    toggle: store.toggle,
  }
}
