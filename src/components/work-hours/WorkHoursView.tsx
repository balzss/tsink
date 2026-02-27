import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { useDateNavigation } from '@/hooks/useDateNavigation'
import { useCalendarEvents, useCalendarEventsForMonth } from '@/hooks/useCalendarEvents'
import { useIncomeSheet } from '@/hooks/useIncomeSheet'
import { useConfigSheet } from '@/hooks/useConfigSheet'
import { EventCard } from './EventCard'
import { DaySummary } from './DaySummary'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { DatePicker } from '@/components/ui/DatePicker'
import { formatDate } from '@/utils/date'

export function WorkHoursView() {
  const { t } = useTranslation()
  const { selectedDate, setSelectedDate, goToPreviousDay, goToNextDay, goToToday, isToday } = useDateNavigation()
  const { data: events, isLoading: eventsLoading } = useCalendarEvents(selectedDate)
  const { data: monthEvents } = useCalendarEventsForMonth(selectedDate)
  const { data: incomeData, isLoading: incomeLoading } = useIncomeSheet()
  const { data: categories } = useConfigSheet()
  const [pickerOpen, setPickerOpen] = useState(false)

  const isLoading = eventsLoading || incomeLoading
  const nonAllDayEvents = events?.filter((e) => !e.allDay) ?? []

  const dayTotal = nonAllDayEvents.reduce((sum, event) => {
    const entry = incomeData?.uidMap.get(event.iCalUID)
    if (entry?.row.is_skipped) return sum
    return sum + (entry?.row.amount ?? 0)
  }, 0)

  const markedDates = useMemo(() => {
    const dates = new Set<string>()
    if (!monthEvents || !incomeData) return dates
    const eventsByDay = new Map<string, typeof monthEvents>()
    for (const event of monthEvents) {
      if (event.allDay) continue
      const day = formatDate(new Date(event.start))
      if (!eventsByDay.has(day)) eventsByDay.set(day, [])
      eventsByDay.get(day)!.push(event)
    }
    for (const [day, dayEvents] of eventsByDay) {
      const hasMissing = dayEvents.some((e) => {
        const entry = incomeData.uidMap.get(e.iCalUID)
        if (entry?.row.is_skipped) return false
        return !entry || entry.row.amount === 0
      })
      if (hasMissing) dates.add(day)
    }
    return dates
  }, [monthEvents, incomeData])

  function handleDatePick(date: Date) {
    setSelectedDate(date)
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={goToPreviousDay}>
          <ChevronLeft size={20} />
        </Button>
        <div className="relative text-center">
          <button
            onClick={() => setPickerOpen(!pickerOpen)}
            className="text-sm font-semibold text-primary-900 dark:text-primary-100"
          >
            {selectedDate.toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </button>
          <DatePicker
            value={selectedDate}
            onChange={handleDatePick}
            open={pickerOpen}
            onClose={() => setPickerOpen(false)}
            markedDates={markedDates}
          />
          {!isToday && (
            <div>
              <Button variant="ghost" size="sm" onClick={goToToday}>
                {t('workHours.today')}
              </Button>
            </div>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={goToNextDay}>
          <ChevronRight size={20} />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : nonAllDayEvents.length === 0 ? (
        <EmptyState icon={<Calendar size={40} />} title={t('workHours.noEvents')} />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {nonAllDayEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                incomeEntry={incomeData?.uidMap.get(event.iCalUID)}
                categories={categories ?? ['General']}
                date={formatDate(selectedDate)}
              />
            ))}
          </div>
          <DaySummary total={dayTotal} />
        </>
      )}
    </div>
  )
}
