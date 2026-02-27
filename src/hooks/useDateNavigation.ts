import { useState, useCallback } from 'react'
import { addDays, isSameDay } from '@/utils/date'

export function useDateNavigation() {
  const [selectedDate, setSelectedDate] = useState(new Date())

  const goToPreviousDay = useCallback(() => {
    setSelectedDate((d) => addDays(d, -1))
  }, [])

  const goToNextDay = useCallback(() => {
    setSelectedDate((d) => addDays(d, 1))
  }, [])

  const goToToday = useCallback(() => {
    setSelectedDate(new Date())
  }, [])

  const isToday = isSameDay(selectedDate, new Date())

  return {
    selectedDate,
    setSelectedDate,
    goToPreviousDay,
    goToNextDay,
    goToToday,
    isToday,
  }
}
