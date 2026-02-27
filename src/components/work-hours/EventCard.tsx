import { useState, useEffect, useRef, memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useUpsertIncome } from '@/hooks/useIncomeSheet'
import { useUpdateCategories } from '@/hooks/useConfigSheet'
import { useSettingsStore } from '@/stores/settings-store'
import { getCurrencySymbol } from '@/utils/currency'
import { formatTime, getDurationMinutes, formatDuration } from '@/utils/date'
import type { CalendarEvent, IncomeRow } from '@/types'
import { Plus, X } from 'lucide-react'

interface EventCardProps {
  event: CalendarEvent
  incomeEntry?: { row: IncomeRow; rowIndex: number }
  categories: string[]
  date: string
}

export const EventCard = memo(function EventCard({ event, incomeEntry, categories, date }: EventCardProps) {
  const { t } = useTranslation()
  const currency = useSettingsStore((s) => s.currency)
  const upsertIncome = useUpsertIncome()
  const updateCategories = useUpdateCategories()

  const duration = getDurationMinutes(event.start, event.end)
  const isSkipped = incomeEntry?.row.is_skipped ?? false
  const [amount, setAmount] = useState(String(incomeEntry?.row.amount ?? ''))
  const [selectedCategories, setSelectedCategories] = useState<string[]>(incomeEntry?.row.categories ?? [])
  const [categoryInput, setCategoryInput] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
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
      upsertIncome.mutate({
        income,
        existingRowIndex: incomeEntry?.rowIndex,
      })
    },
    [event.iCalUID, date, amount, selectedCategories, isSkipped, incomeEntry?.rowIndex, upsertIncome]
  )

  useEffect(() => {
    if (amount === '' || amount === String(incomeEntry?.row.amount ?? '')) return
    const timer = setTimeout(() => {
      save({ amount: Number(amount) || 0 })
    }, 300)
    return () => clearTimeout(timer)
  }, [amount])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function addCategory(value: string) {
    if (selectedCategories.includes(value)) return
    const next = [...selectedCategories, value]
    setSelectedCategories(next)
    setCategoryInput('')
    setShowDropdown(false)
    save({ categories: next })
  }

  function removeCategory(value: string) {
    const next = selectedCategories.filter((c) => c !== value)
    setSelectedCategories(next)
    save({ categories: next })
  }

  function handleAddAsCategory() {
    const trimmed = categoryInput.trim()
    if (!trimmed) return
    if (!categories.includes(trimmed)) {
      updateCategories.mutate([...categories, trimmed])
    }
    addCategory(trimmed)
  }

  function handleToggleSkip(checked: boolean) {
    save({ is_skipped: checked })
  }

  const filteredCategories = categories.filter(
    (cat) => !selectedCategories.includes(cat) && cat.toLowerCase().includes(categoryInput.toLowerCase())
  )
  const isNewValue = categoryInput.trim() !== '' && !categories.includes(categoryInput.trim())

  return (
    <Card className={isSkipped ? 'opacity-50' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-primary-900 dark:text-primary-100">{event.summary}</p>
            <p className="text-sm text-primary-600 dark:text-primary-400">
              {formatTime(event.start)} – {formatTime(event.end)} · {formatDuration(duration)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={isSkipped}
              onCheckedChange={handleToggleSkip}
            />
            <Label className="text-sm text-primary-700 dark:text-primary-300">{t('workHours.skip')}</Label>
          </div>
        </div>

        {!isSkipped && (
          <div className="mt-3 space-y-2">
            <div>
              <Label className="mb-1 text-xs text-primary-600 dark:text-primary-400">
                {t('workHours.amount')} ({getCurrencySymbol(currency)})
              </Label>
              <Input
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="relative" ref={dropdownRef}>
              <Label className="mb-1 text-xs text-primary-600 dark:text-primary-400">
                {t('workHours.category')}
              </Label>
              {selectedCategories.length > 0 && (
                <div className="mb-1.5 flex flex-wrap gap-1">
                  {selectedCategories.map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800 dark:bg-primary-800 dark:text-primary-200"
                    >
                      {cat}
                      <button
                        type="button"
                        onClick={() => removeCategory(cat)}
                        className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-200"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <Input
                type="text"
                value={categoryInput}
                onChange={(e) => { setCategoryInput(e.target.value); setShowDropdown(true) }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                placeholder={t('workHours.selectCategory')}
              />
              {showDropdown && (filteredCategories.length > 0 || isNewValue) && (
                <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-40 overflow-y-auto rounded-lg border border-primary-200 bg-white shadow-lg dark:border-primary-700 dark:bg-primary-800">
                  {filteredCategories.map((cat) => (
                    <button
                      key={cat}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => addCategory(cat)}
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-primary-100 dark:hover:bg-primary-700 text-primary-900 dark:text-primary-100"
                    >
                      {cat}
                    </button>
                  ))}
                  {isNewValue && (
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={handleAddAsCategory}
                      className="flex w-full items-center gap-1 px-3 py-2 text-left text-sm text-primary-700 hover:bg-primary-100 dark:text-primary-300 dark:hover:bg-primary-700"
                    >
                      <Plus size={14} />
                      {t('workHours.addNewCategory', { value: categoryInput.trim() })}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
})
