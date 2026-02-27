import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useIncomeSheet } from '@/hooks/useIncomeSheet'
import { useConfigSheet } from '@/hooks/useConfigSheet'
import { useSummaryData } from '@/hooks/useSummaryData'
import { fetchEventsForMonth } from '@/api/google-calendar'
import { useSettingsStore } from '@/stores/settings-store'
import { useAuthStore } from '@/stores/auth-store'
import { MonthCard } from './MonthCard'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { BarChart3 } from 'lucide-react'
import type { CalendarEvent } from '@/types'

export function SummaryView() {
  const { t } = useTranslation()
  const calendarId = useSettingsStore((s) => s.calendarId)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  const { data: incomeData, isLoading: incomeLoading } = useIncomeSheet()
  const { data: categories } = useConfigSheet()
  const [monthEvents, setMonthEvents] = useState<Map<string, CalendarEvent[]>>(new Map())
  const [eventsLoading, setEventsLoading] = useState(false)
  const [eventsError, setEventsError] = useState<string | null>(null)

  // Derive a stable string of month keys from income data.
  // This prevents the useEffect from re-triggering on every incomeData
  // object reference change (caused by TanStack Query's select).
  const monthKeysString = useMemo(() => {
    const monthKeys = new Set<string>()
    const now = new Date()
    monthKeys.add(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
    if (incomeData) {
      for (const item of incomeData.items) {
        if (item.date) monthKeys.add(item.date.slice(0, 7))
      }
    }
    return Array.from(monthKeys).sort().join(',')
  }, [incomeData?.items.length, incomeData?.items.map((i) => i.date?.slice(0, 7)).join(',')])

  useEffect(() => {
    if (!isAuthenticated || incomeLoading) return

    const keys = monthKeysString.split(',').filter(Boolean)
    if (keys.length === 0) return

    let cancelled = false
    setEventsLoading(true)
    setEventsError(null)

    Promise.all(
      keys.map(async (key) => {
        const [y, m] = key.split('-').map(Number)
        const events = await fetchEventsForMonth(calendarId, new Date(y, m - 1, 1))
        return [key, events] as const
      })
    ).then((results) => {
      if (cancelled) return
      const map = new Map<string, CalendarEvent[]>()
      for (const [key, events] of results) map.set(key, events)
      setMonthEvents(map)
      setEventsLoading(false)
    }).catch((err) => {
      if (cancelled) return
      console.error('Failed to fetch calendar events:', err)
      setEventsError(err instanceof Error ? err.message : 'Failed to load events')
      setEventsLoading(false)
    })

    return () => { cancelled = true }
  }, [isAuthenticated, calendarId, monthKeysString, incomeLoading])

  const { months, isLoading: summaryLoading } = useSummaryData(monthEvents)

  if (incomeLoading || eventsLoading || summaryLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    )
  }

  if (eventsError) {
    return (
      <div className="p-4">
        <EmptyState
          icon={<BarChart3 size={40} />}
          title={t('common.error')}
          description={eventsError}
        />
      </div>
    )
  }

  if (months.length === 0) {
    return (
      <div className="p-4">
        <EmptyState icon={<BarChart3 size={40} />} title={t('summary.noData')} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-8">
      {months.map((month) => (
        <MonthCard
          key={month.key}
          month={month}
          categories={categories ?? ['General']}
        />
      ))}
    </div>
  )
}
