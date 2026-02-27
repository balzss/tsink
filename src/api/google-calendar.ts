import { getAuthHeaders } from './google-auth'
import type { CalendarEvent } from '@/types'

const BASE = 'https://www.googleapis.com/calendar/v3'

interface CalendarEventResource {
  id: string
  iCalUID: string
  summary?: string
  start: { dateTime?: string; date?: string }
  end: { dateTime?: string; date?: string }
}

interface CalendarListResponse {
  items: CalendarEventResource[]
  nextPageToken?: string
}

export async function fetchEventsForDay(
  calendarId: string,
  date: Date
): Promise<CalendarEvent[]> {
  const timeMin = new Date(date)
  timeMin.setHours(0, 0, 0, 0)
  const timeMax = new Date(date)
  timeMax.setHours(23, 59, 59, 999)

  return fetchEvents(calendarId, timeMin, timeMax)
}

export async function fetchEventsForMonth(
  calendarId: string,
  date: Date
): Promise<CalendarEvent[]> {
  const timeMin = new Date(date.getFullYear(), date.getMonth(), 1)
  const timeMax = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)

  return fetchEvents(calendarId, timeMin, timeMax)
}

async function fetchEvents(
  calendarId: string,
  timeMin: Date,
  timeMax: Date
): Promise<CalendarEvent[]> {
  const headers = await getAuthHeaders()
  const params = new URLSearchParams({
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '250',
  })

  const allItems: CalendarEventResource[] = []
  let pageToken: string | undefined

  do {
    if (pageToken) params.set('pageToken', pageToken)
    const res = await fetch(
      `${BASE}/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
      { headers }
    )
    if (!res.ok) throw new Error(`Calendar API error: ${res.status}`)
    const data: CalendarListResponse = await res.json()
    allItems.push(...data.items)
    pageToken = data.nextPageToken
  } while (pageToken)

  return allItems.map(mapEvent)
}

function mapEvent(e: CalendarEventResource): CalendarEvent {
  const allDay = !e.start.dateTime
  return {
    id: e.id,
    iCalUID: e.iCalUID,
    summary: e.summary ?? '(No title)',
    start: e.start.dateTime ?? e.start.date!,
    end: e.end.dateTime ?? e.end.date!,
    allDay,
  }
}
