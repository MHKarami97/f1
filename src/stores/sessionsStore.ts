import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { OpenF1Repository } from '@/repository'
import type { Meeting, Session } from '@/types'

const repo = new OpenF1Repository()
const CURRENT_YEAR = new Date().getFullYear()
// OpenF1 real-time endpoints (laps/intervals/position) require a paid plan
// (see https://openf1.org/docs). This flag lets the UI gracefully hide the
// live section instead of polling an endpoint that will keep failing.
const REALTIME_DATA_ENABLED = false

export const useSessionsStore = defineStore('sessions', () => {
  const meetings = ref<Meeting[]>([])
  const sessions = ref<Session[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const now = () => new Date()

  const raceSessions = computed(() =>
    sessions.value.filter((s) => s.session_type === 'Race' && !s.is_cancelled),
  )

  const latestFinishedRaceSession = computed<Session | null>(() => {
    const past = raceSessions.value
      .filter((s) => new Date(s.date_end) < now())
      .sort((a, b) => new Date(b.date_start).getTime() - new Date(a.date_start).getTime())
    return past[0] ?? null
  })

  const currentSession = computed<Session | null>(() => {
    const t = now()
    return sessions.value.find((s) => new Date(s.date_start) <= t && t <= new Date(s.date_end)) ?? null
  })

  const isLive = computed(() => REALTIME_DATA_ENABLED && currentSession.value !== null)

  const nextMeeting = computed<Meeting | null>(() => {
    const t = now()
    const upcoming = meetings.value
      .filter((m) => new Date(m.date_start) > t)
      .sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime())
    return upcoming[0] ?? null
  })

  const pastMeetings = computed(() => {
    const t = now()
    return meetings.value.filter((m) => new Date(m.date_start) <= t).slice().reverse()
  })

  function sessionKeyForMeeting(meetingKey: number): number | null {
    return raceSessions.value.find((s) => s.meeting_key === meetingKey)?.session_key ?? null
  }

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

  return {
    meetings,
    sessions,
    isLoading,
    error,
    raceSessions,
    latestFinishedRaceSession,
    currentSession,
    isLive,
    nextMeeting,
    pastMeetings,
    sessionKeyForMeeting,
    fetchCalendar,
  }
})
