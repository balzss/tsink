import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useUpsertIncome } from '@/hooks/useIncomeSheet'
import { useSettingsStore } from '@/stores/settings-store'
import { getCurrencySymbol } from '@/utils/currency'
import { formatTime, getDurationMinutes, formatDuration } from '@/utils/date'
import type { CalendarEvent, IncomeRow } from '@/types'
import { X } from 'lucide-react'

interface InlineEventCardProps {
  event: CalendarEvent
  incomeEntry?: { row: IncomeRow; rowIndex: number }
  categories: string[]
  date: string
}

export function InlineEventCard({ event, incomeEntry, categories, date }: InlineEventCardProps) {
  const { t } = useTranslation()
  const currency = useSettingsStore((s) => s.currency)
  const upsertIncome = useUpsertIncome()

  const duration = getDurationMinutes(event.start, event.end)
  const isSkipped = incomeEntry?.row.is_skipped ?? false
  const [amount, setAmount] = useState(String(incomeEntry?.row.amount ?? ''))
  const [selectedCategories, setSelectedCategories] = useState<string[]>(incomeEntry?.row.categories ?? [])
  const syncedRef = useRef(!!incomeEntry)

  useEffect(() => {
    if (syncedRef.current) return
    if (incomeEntry) {
      setAmount(String(incomeEntry.row.amount ?? ''))
      setSelectedCategories(incomeEntry.row.categories ?? [])
      syncedRef.current = true
    }
  }, [incomeEntry])

  const save = useCallback(
    (updates: Partial<IncomeRow>) => {
      const income: IncomeRow = {
        ical_uid: event.iCalUID,
        date,
        amount: updates.amount ?? (Number(amount) || 0),
        categories: updates.categories ?? selectedCategories,
        is_skipped: updates.is_skipped ?? isSkipped,
      }
      upsertIncome.mutate({ income, existingRowIndex: incomeEntry?.rowIndex })
    },
    [event.iCalUID, date, amount, selectedCategories, isSkipped, incomeEntry?.rowIndex, upsertIncome]
  )

  useEffect(() => {
    if (amount === '' || amount === String(incomeEntry?.row.amount ?? '')) return
    const timer = setTimeout(() => save({ amount: Number(amount) || 0 }), 300)
    return () => clearTimeout(timer)
  }, [amount])

  function addCategory(value: string) {
    if (selectedCategories.includes(value)) return
    const next = [...selectedCategories, value]
    setSelectedCategories(next)
    save({ categories: next })
  }

  function removeCategory(value: string) {
    const next = selectedCategories.filter((c) => c !== value)
    setSelectedCategories(next)
    save({ categories: next })
  }

  const availableCategories = categories.filter((c) => !selectedCategories.includes(c))

  return (
    <div className={`rounded-lg border border-primary-200 bg-white p-3 dark:border-primary-700 dark:bg-primary-800 ${isSkipped ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-primary-900 dark:text-primary-100">{event.summary}</p>
          <p className="text-xs text-primary-500 dark:text-primary-400">
            {formatTime(event.start)} – {formatTime(event.end)} · {formatDuration(duration)}
          </p>
        </div>
        <Switch
          checked={isSkipped}
          onCheckedChange={(checked: boolean) => save({ is_skipped: checked })}
        />
      </div>
      {!isSkipped && (
        <div className="flex flex-col gap-2">
          <Input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`${t('workHours.amount')} (${getCurrencySymbol(currency)})`}
          />
          {selectedCategories.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selectedCategories.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-0.5 rounded-full bg-primary-100 px-2 py-0.5 text-xs text-primary-800 dark:bg-primary-700 dark:text-primary-200"
                >
                  {cat}
                  <button type="button" onClick={() => removeCategory(cat)}>
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
          {availableCategories.length > 0 && (
            <Select value="" onValueChange={(value) => { if (value) addCategory(value) }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('workHours.selectCategory')} />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}
    </div>
  )
}
