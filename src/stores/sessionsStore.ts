import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { OpenF1Repository } from '@/repository/OpenF1Repository'
import type { Meeting, Session } from '@/types'

const repo = new OpenF1Repository()
const CURRENT_YEAR = new Date().getFullYear()

export const useSessionsStore = defineStore('sessions', () => {
  const meetings = ref<Meeting[]>([])
  const sessions = ref<Session[]>([])
  const activeSession = ref<Session | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const nextMeeting = computed(() => {
    const now = new Date()
    return meetings.value.find((m) => new Date(m.date_start) > now) ?? null
  })

  const pastMeetings = computed(() => {
    const now = new Date()
    return meetings.value.filter((m) => new Date(m.date_start) <= now).reverse()
  })

  async function fetchCalendar(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const [fetchedMeetings, fetchedSessions] = await Promise.all([
        repo.getMeetings(CURRENT_YEAR),
        repo.getSessions(CURRENT_YEAR),
      ])
      meetings.value = fetchedMeetings
      sessions.value = fetchedSessions
    } catch {
      error.value = 'تقویم مسابقات در دسترس نیست'
    } finally {
      isLoading.value = false
    }
  }

  async function checkActiveSession(): Promise<void> {
    try {
      activeSession.value = await repo.getActiveSession()
    } catch {
      activeSession.value = null
    }
  }

  return {
    meetings,
    sessions,
    activeSession,
    isLoading,
    error,
    nextMeeting,
    pastMeetings,
    fetchCalendar,
    checkActiveSession,
  }
})
