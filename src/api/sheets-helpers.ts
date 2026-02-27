import type { IncomeRow } from '@/types'
import type { ExpenseRow } from '@/types'

function parseCategories(raw: string): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed
  } catch {
    // Backward compat: plain string from old format
  }
  return raw ? [raw] : []
}

export function rowsToIncomeObjects(rows: string[][]): IncomeRow[] {
  if (rows.length <= 1) return []
  return rows.slice(1).map((row) => ({
    ical_uid: row[0] ?? '',
    date: row[1] ?? '',
    amount: Number(row[2]) || 0,
    categories: parseCategories(row[3] ?? ''),
    is_skipped: row[4] === 'true',
  }))
}

export function incomeToRow(income: IncomeRow): string[] {
  return [
    income.ical_uid,
    income.date,
    String(income.amount),
    JSON.stringify(income.categories),
    String(income.is_skipped),
  ]
}

export function rowsToExpenseObjects(rows: string[][]): ExpenseRow[] {
  if (rows.length <= 1) return []
  return rows.slice(1).map((row) => ({
    id: row[0] ?? '',
    name: row[1] ?? '',
    date: row[2] ?? '',
    amount: Number(row[3]) || 0,
    is_recurring: row[4] === 'true',
  }))
}

export function expenseToRow(expense: ExpenseRow): string[] {
  return [
    expense.id,
    expense.name,
    expense.date,
    String(expense.amount),
    String(expense.is_recurring),
  ]
}

export function parseConfigCategories(rows: string[][]): string[] {
  if (rows.length <= 1) return ['General']
  const categoriesRow = rows.find((row) => row[0] === 'categories')
  if (!categoriesRow || !categoriesRow[1]) return ['General']
  try {
    return JSON.parse(categoriesRow[1])
  } catch {
    return ['General']
  }
}
