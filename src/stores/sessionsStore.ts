import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { OpenF1Repository } from '@/repository'
import { readCache, writeCache, CACHE_TTL } from '@/services/cache'
import type { Meeting, Session } from '@/types'

const repo = new OpenF1Repository()
const CURRENT_YEAR = new Date().getFullYear()
const REALTIME_DATA_ENABLED = false
const CALENDAR_CACHE_KEY = `calendar:${CURRENT_YEAR}`

interface CalendarCachePayload {
  meetings: Meeting[]
  sessions: Session[]
}

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

  /**
   * The season calendar only actually goes stale once the next scheduled
   * race weekend happens, so instead of a flat TTL we cache it until that
   * race's start time — floored at 1 hour (still catches same-day schedule
   * tweaks) and capped at 7 days (off-season safety net so a stale
   * calendar never lingers indefinitely with no upcoming race to key off).
   */
  async function fetchCalendar(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const cached = readCache<CalendarCachePayload>(CALENDAR_CACHE_KEY)
      if (cached) {
        meetings.value = cached.meetings
        sessions.value = cached.sessions
        return
      }

      const [fetchedMeetings, fetchedSessions] = await Promise.all([
        repo.getMeetings(CURRENT_YEAR, CACHE_TTL.LIVE),
        repo.getSessions(CURRENT_YEAR, CACHE_TTL.LIVE),
      ])
      meetings.value = fetchedMeetings
      sessions.value = fetchedSessions

      const nowMs = Date.now()
      const upcoming = fetchedMeetings
        .filter((m) => new Date(m.date_start).getTime() > nowMs)
        .sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime())[0]
      const ttl = upcoming
        ? Math.min(Math.max(new Date(upcoming.date_start).getTime() - nowMs, CACHE_TTL.CALENDAR_MIN), CACHE_TTL.CALENDAR_MAX)
        : CACHE_TTL.CALENDAR_MAX

      writeCache(CALENDAR_CACHE_KEY, { meetings: fetchedMeetings, sessions: fetchedSessions }, ttl)
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