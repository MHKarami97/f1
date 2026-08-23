import { ref, onMounted, onUnmounted } from 'vue'
import { useSessionsStore } from '@/stores/sessionsStore'
import { createPollingStrategy } from '@/services/polling'
import type { PollingStrategy } from '@/services/polling'

// Switches between live polling (5s) and static no-op based on session status
export function useLiveSession() {
  const store = useSessionsStore()
  const isLive = ref(false)
  let strategy: PollingStrategy | null = null

  async function checkLive(): Promise<void> {
    await store.checkActiveSession()
    const wasLive = isLive.value
    isLive.value = store.activeSession !== null

    if (isLive.value && !wasLive) {
      strategy?.stop()
      strategy = createPollingStrategy(true)
      strategy.start(checkLive)
    } else if (!isLive.value && wasLive) {
      strategy?.stop()
      strategy = null
    }
  }

  onMounted(() => void checkLive())
  onUnmounted(() => strategy?.stop())

  return {
    isLive,
    activeSession: store.activeSession,
  }
}
