import { memo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useSettingsStore } from '@/stores/settings-store'
import { formatCurrency } from '@/utils/currency'
import { Repeat, Pencil } from 'lucide-react'
import type { ExpenseRow } from '@/types'

interface ExpenseRowItemProps {
  expense: ExpenseRow
  onEdit: () => void
}

export const ExpenseRowItem = memo(function ExpenseRowItem({ expense, onEdit }: ExpenseRowItemProps) {
  const currency = useSettingsStore((s) => s.currency)

  return (
    <Card className="cursor-pointer active:bg-primary-50 dark:active:bg-primary-800" onClick={onEdit}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-primary-900 dark:text-primary-100">{expense.name}</span>
              {expense.is_recurring && (
                <Repeat size={14} className="text-primary-600 dark:text-primary-400" />
              )}
            </div>
            {expense.date && (
              <p className="text-xs text-primary-600 dark:text-primary-500">{expense.date}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-primary-900 dark:text-primary-100">
              {formatCurrency(expense.amount, currency)}
            </span>
            <Pencil size={14} className="text-primary-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
