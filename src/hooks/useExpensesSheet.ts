import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { readSheet, appendRow, updateRow, deleteRow, getSheetIds } from '@/api/google-sheets'
import { rowsToExpenseObjects, expenseToRow } from '@/api/sheets-helpers'
import { useSettingsStore } from '@/stores/settings-store'
import { useAuthStore } from '@/stores/auth-store'
import type { ExpenseRow } from '@/types'

export function useExpensesSheet() {
  const spreadsheetId = useSettingsStore((s) => s.spreadsheetId)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())

  return useQuery({
    queryKey: ['expenses-sheet', spreadsheetId],
    queryFn: () => readSheet(spreadsheetId!, 'expenses'),
    enabled: isAuthenticated && !!spreadsheetId,
    staleTime: 5 * 60 * 1000,
    select: rowsToExpenseObjects,
  })
}

export function useAddExpense() {
  const spreadsheetId = useSettingsStore((s) => s.spreadsheetId)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (expense: ExpenseRow) => {
      if (!spreadsheetId) throw new Error('No spreadsheet ID')
      await appendRow(spreadsheetId, 'expenses', expenseToRow(expense))
    },
    onMutate: async (expense) => {
      await queryClient.cancelQueries({ queryKey: ['expenses-sheet', spreadsheetId] })
      const previous = queryClient.getQueryData<string[][]>(['expenses-sheet', spreadsheetId])

      queryClient.setQueryData<string[][]>(['expenses-sheet', spreadsheetId], (old) => {
        if (!old) return old
        return [...old, expenseToRow(expense)]
      })

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['expenses-sheet', spreadsheetId], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses-sheet', spreadsheetId] })
    },
  })
}

export function useUpdateExpense() {
  const spreadsheetId = useSettingsStore((s) => s.spreadsheetId)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ expense, rowIndex }: { expense: ExpenseRow; rowIndex: number }) => {
      if (!spreadsheetId) throw new Error('No spreadsheet ID')
      await updateRow(
        spreadsheetId,
        `expenses!A${rowIndex}:E${rowIndex}`,
        expenseToRow(expense)
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses-sheet', spreadsheetId] })
    },
  })
}

export function useDeleteExpense() {
  const spreadsheetId = useSettingsStore((s) => s.spreadsheetId)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (rowIndex: number) => {
      if (!spreadsheetId) throw new Error('No spreadsheet ID')
      const sheetIds = await getSheetIds(spreadsheetId)
      const expensesSheetId = sheetIds['expenses']
      if (expensesSheetId === undefined) throw new Error('expenses sheet not found')
      await deleteRow(spreadsheetId, expensesSheetId, rowIndex)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses-sheet', spreadsheetId] })
    },
  })
}
