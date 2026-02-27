import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Receipt } from 'lucide-react'
import { useExpensesSheet, useAddExpense } from '@/hooks/useExpensesSheet'
import { ExpenseRowItem } from './ExpenseRow'
import { ExpenseForm } from './ExpenseForm'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { DatePickerField } from '@/components/ui/DatePickerField'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { generateId } from '@/utils/uuid'
import { formatDate } from '@/utils/date'
import type { ExpenseRow } from '@/types'

export function ExpensesView() {
  const { t } = useTranslation()
  const { data: expenses, isLoading } = useExpensesSheet()
  const addExpense = useAddExpense()
  const [editingExpense, setEditingExpense] = useState<{ expense: ExpenseRow; rowIndex: number } | null>(null)

  const [name, setName] = useState('')
  const [date, setDate] = useState(formatDate(new Date()))
  const [amount, setAmount] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)

  const recurring = useMemo(() =>
    (expenses ?? []).filter((e) => e.is_recurring),
    [expenses]
  )
  const oneTime = useMemo(() =>
    (expenses ?? []).filter((e) => !e.is_recurring),
    [expenses]
  )

  function handleAdd() {
    const expense: ExpenseRow = {
      id: generateId(),
      name: name.trim(),
      date,
      amount: Number(amount) || 0,
      is_recurring: isRecurring,
    }
    addExpense.mutate(expense)
    setName('')
    setAmount('')
    setDate(formatDate(new Date()))
    setIsRecurring(false)
  }

  function handleEdit(expense: ExpenseRow, index: number) {
    setEditingExpense({ expense, rowIndex: index + 2 })
  }

  const isValid = name.trim().length > 0 && (Number(amount) || 0) > 0

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4 pb-8">
      <Card>
        <CardContent className="p-4">
          <h3 className="mb-3 text-sm font-semibold text-primary-900 dark:text-primary-100">
            {t('expenses.addExpense')}
          </h3>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <Label>{t('expenses.name')}</Label>
              <Input
                placeholder={t('expenses.namePlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <DatePickerField
                  label={t('expenses.date')}
                  value={date}
                  onChange={setDate}
                />
              </div>
              <div className="flex-1">
                <div className="flex flex-col gap-1">
                  <Label>{t('expenses.amount')}</Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={isRecurring}
                  onCheckedChange={setIsRecurring}
                />
                <Label>{t('expenses.isRecurring')}</Label>
              </div>
              <Button onClick={handleAdd} disabled={!isValid} size="sm">
                {t('expenses.add')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {(!expenses || expenses.length === 0) ? (
        <EmptyState icon={<Receipt size={40} />} title={t('expenses.noExpenses')} />
      ) : (
        <>
          {recurring.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary-500 dark:text-primary-400">
                {t('expenses.recurring')}
              </h2>
              <div className="flex flex-col gap-2">
                {recurring.map((expense) => (
                  <ExpenseRowItem
                    key={expense.id}
                    expense={expense}
                    onEdit={() => handleEdit(expense, (expenses ?? []).indexOf(expense))}
                  />
                ))}
              </div>
            </section>
          )}
          {oneTime.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary-500 dark:text-primary-400">
                {t('expenses.oneTime')}
              </h2>
              <div className="flex flex-col gap-2">
                {oneTime.map((expense) => (
                  <ExpenseRowItem
                    key={expense.id}
                    expense={expense}
                    onEdit={() => handleEdit(expense, (expenses ?? []).indexOf(expense))}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {editingExpense && (
        <ExpenseForm
          open={!!editingExpense}
          onClose={() => setEditingExpense(null)}
          editingExpense={editingExpense}
        />
      )}
    </div>
  )
}
