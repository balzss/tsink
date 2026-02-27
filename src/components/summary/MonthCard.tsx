import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useSettingsStore } from '@/stores/settings-store'
import { formatCurrency } from '@/utils/currency'
import { InlineEventCard } from './InlineEventCard'
import { useIncomeSheet } from '@/hooks/useIncomeSheet'
import type { MonthSummary } from '@/hooks/useSummaryData'

interface MonthCardProps {
  month: MonthSummary
  categories: string[]
}

export function MonthCard({ month, categories }: MonthCardProps) {
  const { t } = useTranslation()
  const currency = useSettingsStore((s) => s.currency)
  const { data: incomeData } = useIncomeSheet()
  const [expandedDay, setExpandedDay] = useState<string | null>(null)

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <h3 className="text-base font-semibold text-primary-900 dark:text-primary-100 capitalize">
          {month.label}
          {month.isCurrentMonth && (
            <span className="ml-2 text-xs font-normal text-primary-600 dark:text-primary-500">
              ({t('summary.currentMonth')})
            </span>
          )}
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-primary-600 dark:text-primary-400">{t('summary.hoursWorked')}</p>
            <p className="text-lg font-bold text-primary-900 dark:text-primary-100">{month.hoursWorked}h</p>
          </div>
          <div>
            <p className="text-xs text-primary-600 dark:text-primary-400">{t('summary.daysWorked')}</p>
            <p className="text-lg font-bold text-primary-900 dark:text-primary-100">{month.daysWorked}</p>
          </div>
          <div>
            <p className="text-xs text-primary-600 dark:text-primary-400">{t('summary.totalIncome')}</p>
            <p className="text-lg font-bold text-primary-900 dark:text-primary-100">
              {formatCurrency(month.totalIncome, currency)}
            </p>
          </div>
          {!month.isCurrentMonth && (
            <div>
              <p className="text-xs text-primary-600 dark:text-primary-400">{t('summary.profit')}</p>
              <p className={`text-lg font-bold ${
                month.profit >= 0
                  ? 'text-primary-700 dark:text-primary-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {formatCurrency(month.profit, currency)}
              </p>
            </div>
          )}
        </div>

        {month.incompleteDays.length > 0 && (
          <div className="rounded-xl border border-primary-200 bg-primary-50 dark:border-primary-700 dark:bg-primary-800/50">
            <button
              onClick={() => setExpandedDay(expandedDay ? null : '__all__')}
              className="flex w-full items-center justify-between p-3"
            >
              <div className="flex items-center gap-2">
                <AlertCircle size={14} className="text-primary-600 dark:text-primary-400" />
                <span className="text-xs font-medium text-primary-700 dark:text-primary-300">
                  {t('summary.daysWithMissing', { count: month.incompleteDays.length })}
                </span>
              </div>
              {expandedDay ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {expandedDay && (
              <div className="border-t border-primary-200 dark:border-primary-700">
                {month.incompleteDays.map((day) => (
                  <div key={day.date} className="border-b border-primary-100 last:border-b-0 dark:border-primary-700/50">
                    <button
                      onClick={() => setExpandedDay(expandedDay === day.date ? '__all__' : day.date)}
                      className="flex w-full items-center justify-between px-3 py-2 text-left"
                    >
                      <span className="text-sm font-medium text-primary-900 dark:text-primary-100">
                        {new Date(day.date + 'T00:00:00').toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="text-xs text-primary-600 dark:text-primary-400">
                        {day.events.length} event{day.events.length > 1 ? 's' : ''}
                      </span>
                    </button>

                    {expandedDay === day.date && (
                      <div className="flex flex-col gap-2 px-2 pb-3">
                        {day.events.map((event) => (
                          <InlineEventCard
                            key={event.id}
                            event={event}
                            incomeEntry={incomeData?.uidMap.get(event.iCalUID)}
                            categories={categories}
                            date={day.date}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {month.incompleteDays.length === 0 && (
          <p className="text-center text-xs text-primary-600 dark:text-primary-400">
            {t('summary.noIncomplete')}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
