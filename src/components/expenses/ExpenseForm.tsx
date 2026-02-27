import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { DatePickerField } from '@/components/ui/DatePickerField'
import { useUpdateExpense, useDeleteExpense } from '@/hooks/useExpensesSheet'
import type { ExpenseRow } from '@/types'

interface ExpenseFormProps {
  open: boolean
  onClose: () => void
  editingExpense: { expense: ExpenseRow; rowIndex: number }
}

export function ExpenseForm({ open, onClose, editingExpense }: ExpenseFormProps) {
  const { t } = useTranslation()
  const updateExpense = useUpdateExpense()
  const deleteExpense = useDeleteExpense()

  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [amount, setAmount] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)

  useEffect(() => {
    setName(editingExpense.expense.name)
    setDate(editingExpense.expense.date)
    setAmount(String(editingExpense.expense.amount))
    setIsRecurring(editingExpense.expense.is_recurring)
  }, [editingExpense, open])

  function handleSave() {
    const expense: ExpenseRow = {
      id: editingExpense.expense.id,
      name: name.trim(),
      date,
      amount: Number(amount) || 0,
      is_recurring: isRecurring,
    }
    updateExpense.mutate({ expense, rowIndex: editingExpense.rowIndex })
    onClose()
  }

  function handleDelete() {
    if (!confirm(t('expenses.confirmDelete'))) return
    deleteExpense.mutate(editingExpense.rowIndex)
    onClose()
  }

  const isValid = name.trim().length > 0 && (Number(amount) || 0) > 0

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('expenses.editExpense')}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Label>{t('expenses.name')}</Label>
            <Input
              placeholder={t('expenses.namePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <DatePickerField
            label={t('expenses.date')}
            value={date}
            onChange={setDate}
          />
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
          <div className="flex items-center gap-2">
            <Switch
              checked={isRecurring}
              onCheckedChange={setIsRecurring}
            />
            <Label>{t('expenses.isRecurring')}</Label>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="destructive" onClick={handleDelete} className="flex-1">
              {t('expenses.delete')}
            </Button>
            <Button onClick={handleSave} disabled={!isValid} className="flex-1">
              {t('expenses.update')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
