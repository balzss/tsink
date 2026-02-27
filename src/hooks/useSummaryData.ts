import { useMemo } from 'react'
import { useIncomeSheet } from './useIncomeSheet'
import { useExpensesSheet } from './useExpensesSheet'
import { getDurationMinutes, formatDate } from '@/utils/date'
import type { CalendarEvent } from '@/types'

export interface IncompleteDay {
  date: string
  events: CalendarEvent[]
}

export interface MonthSummary {
  key: string
  year: number
  month: number
  label: string
  hoursWorked: number
  daysWorked: number
  totalIncome: number
  totalExpenses: number
  profit: number
  isCurrentMonth: boolean
  incompleteDays: IncompleteDay[]
}

interface UseSummaryResult {
  months: MonthSummary[]
  isLoading: boolean
}

export function useSummaryData(monthEvents: Map<string, CalendarEvent[]>): UseSummaryResult {
  const incomeQuery = useIncomeSheet()
  const expensesQuery = useExpensesSheet()

  const isLoading = incomeQuery.isLoading || expensesQuery.isLoading

  return useMemo(() => {
    const incomeData = incomeQuery.data
    const expenses = expensesQuery.data ?? []

    if (!incomeData) {
      return { months: [], isLoading }
    }

    const now = new Date()
    const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const monthSet = new Set<string>()

    for (const item of incomeData.items) {
      if (item.date) {
        const d = item.date.slice(0, 7)
        monthSet.add(d)
      }
    }

    for (const [key] of monthEvents) {
      monthSet.add(key)
    }

    if (monthSet.size === 0) monthSet.add(currentKey)

    const recurringTotal = expenses
      .filter((e) => e.is_recurring)
      .reduce((sum, e) => sum + e.amount, 0)

    const monthSummaries: MonthSummary[] = []

    for (const monthKey of monthSet) {
      const [year, month] = monthKey.split('-').map(Number)
      const isCurrentMonth = monthKey === currentKey

      const events = monthEvents.get(monthKey) ?? []

      const monthIncome = incomeData.items.filter(
        (i) => i.date.startsWith(monthKey) && !i.is_skipped
      )

      let totalMinutes = 0
      const workedDays = new Set<string>()

      for (const event of events) {
        const entry = incomeData.uidMap.get(event.iCalUID)
        if (entry?.row.is_skipped) continue
        if (!event.allDay) {
          totalMinutes += getDurationMinutes(event.start, event.end)
          workedDays.add(formatDate(new Date(event.start)))
        }
      }

      const totalIncome = monthIncome.reduce((sum, i) => sum + i.amount, 0)

      const oneTimeExpenses = expenses
        .filter((e) => !e.is_recurring && e.date.startsWith(monthKey))
        .reduce((sum, e) => sum + e.amount, 0)

      const totalExpenses = recurringTotal + oneTimeExpenses

      const eventsByDay = new Map<string, CalendarEvent[]>()
      for (const event of events) {
        if (event.allDay) continue
        const day = formatDate(new Date(event.start))
        if (!eventsByDay.has(day)) eventsByDay.set(day, [])
        eventsByDay.get(day)!.push(event)
      }

      const incompleteDays: IncompleteDay[] = []
      for (const [day, dayEvents] of eventsByDay) {
        const hasMissing = dayEvents.some((e) => {
          const entry = incomeData.uidMap.get(e.iCalUID)
          if (entry?.row.is_skipped) return false
          return !entry || entry.row.amount === 0
        })
        if (hasMissing) {
          incompleteDays.push({ date: day, events: dayEvents })
        }
      }
      incompleteDays.sort((a, b) => a.date.localeCompare(b.date))

      const dateForLabel = new Date(year, month - 1, 1)
      const label = dateForLabel.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

      monthSummaries.push({
        key: monthKey,
        year,
        month,
        label,
        hoursWorked: Math.round((totalMinutes / 60) * 10) / 10,
        daysWorked: workedDays.size,
        totalIncome,
        totalExpenses,
        profit: totalIncome - totalExpenses,
        isCurrentMonth,
        incompleteDays,
      })
    }

    monthSummaries.sort((a, b) => b.key.localeCompare(a.key))

    return { months: monthSummaries, isLoading }
  }, [incomeQuery.data, expensesQuery.data, monthEvents, isLoading])
}
