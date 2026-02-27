import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '@/stores/settings-store'
import { formatCurrency } from '@/utils/currency'

interface DaySummaryProps {
  total: number
}

export function DaySummary({ total }: DaySummaryProps) {
  const { t } = useTranslation()
  const currency = useSettingsStore((s) => s.currency)

  return (
    <div className="flex items-center justify-between rounded-xl bg-primary-100 p-4 dark:bg-primary-800">
      <span className="font-medium text-primary-800 dark:text-primary-200">
        {t('workHours.daySummary')}
      </span>
      <span className="text-lg font-bold text-primary-900 dark:text-primary-100">
        {formatCurrency(total, currency)}
      </span>
    </div>
  )
}
