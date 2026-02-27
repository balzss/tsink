import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface DatePickerProps {
  value: Date
  onChange: (date: Date) => void
  open: boolean
  onClose: () => void
  markedDates?: Set<string>
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

export function DatePicker({ value, onChange, open, onClose, markedDates }: DatePickerProps) {
  const [viewYear, setViewYear] = useState(value.getFullYear())
  const [viewMonth, setViewMonth] = useState(value.getMonth())
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setViewYear(value.getFullYear())
    setViewMonth(value.getMonth())
  }, [value, open])

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, onClose])

  if (!open) return null

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth)
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`
  const selectedStr = `${value.getFullYear()}-${value.getMonth()}-${value.getDate()}`

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(viewYear - 1)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(viewYear + 1)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  function selectDay(day: number) {
    onChange(new Date(viewYear, viewMonth, day))
    onClose()
  }

  function formatDateKey(year: number, month: number, day: number): string {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div
      ref={ref}
      className="absolute left-1/2 top-full z-50 mt-2 w-72 -translate-x-1/2 rounded-xl border border-primary-200 bg-white p-3 shadow-xl dark:border-primary-700 dark:bg-primary-900"
    >
      <div className="mb-2 flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="rounded-lg p-1.5 hover:bg-primary-100 dark:hover:bg-primary-800"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-semibold text-primary-900 dark:text-primary-100">
          {new Date(viewYear, viewMonth).toLocaleDateString(undefined, {
            month: 'long',
            year: 'numeric',
          })}
        </span>
        <button
          onClick={nextMonth}
          className="rounded-lg p-1.5 hover:bg-primary-100 dark:hover:bg-primary-800"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center">
        {weekDays.map((d) => (
          <div key={d} className="py-1 text-xs font-medium text-primary-400 dark:text-primary-500">
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} />
          }
          const dayStr = `${viewYear}-${viewMonth}-${day}`
          const isToday = dayStr === todayStr
          const isSelected = dayStr === selectedStr
          const dateKey = formatDateKey(viewYear, viewMonth, day)
          const isMarked = markedDates?.has(dateKey) ?? false

          return (
            <button
              key={day}
              onClick={() => selectDay(day)}
              className={`relative rounded-lg py-1.5 text-sm transition-colors ${
                isSelected
                  ? 'bg-primary-900 font-semibold text-white dark:bg-primary-100 dark:text-primary-900'
                  : isToday
                    ? 'bg-primary-200 font-medium text-primary-800 dark:bg-primary-800 dark:text-primary-200'
                    : 'text-primary-700 hover:bg-primary-100 dark:text-primary-300 dark:hover:bg-primary-800'
              }`}
            >
              {day}
              {isMarked && (
                <span
                  className={`absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${
                    isSelected
                      ? 'bg-white dark:bg-primary-900'
                      : 'bg-amber-500'
                  }`}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
