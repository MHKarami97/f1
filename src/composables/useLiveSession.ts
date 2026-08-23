import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSessionsStore } from '@/stores'

/**
 * Exposes whether a session is currently live. Actual 5s polling of
 * results/race-control is delegated to useRaceDetail once a live
 * session_key is known, using the Strategy pattern in services/polling.ts.
 */
export function useLiveSession() {
  const store = useSessionsStore()
  const { isLive, currentSession } = storeToRefs(store)

  return {
    isLive: computed(() => isLive.value),
    activeSession: computed(() => currentSession.value),
  }
}
