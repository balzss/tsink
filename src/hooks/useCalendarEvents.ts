import { useQuery } from '@tanstack/react-query'
import { fetchEventsForDay, fetchEventsForMonth } from '@/api/google-calendar'
import { useSettingsStore } from '@/stores/settings-store'
import { useAuthStore } from '@/stores/auth-store'
import { formatDate } from '@/utils/date'

export function useCalendarEvents(date: Date) {
  const calendarId = useSettingsStore((s) => s.calendarId)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())

  return useQuery({
    queryKey: ['calendar-events', calendarId, formatDate(date)],
    queryFn: () => fetchEventsForDay(calendarId, date),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCalendarEventsForMonth(date: Date) {
  const calendarId = useSettingsStore((s) => s.calendarId)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())

  return useQuery({
    queryKey: ['calendar-events-month', calendarId, date.getFullYear(), date.getMonth()],
    queryFn: () => fetchEventsForMonth(calendarId, date),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  })
}
