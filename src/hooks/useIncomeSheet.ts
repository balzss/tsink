import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { readSheet, appendRow, updateRow } from '@/api/google-sheets'
import { rowsToIncomeObjects, incomeToRow } from '@/api/sheets-helpers'
import { useSettingsStore } from '@/stores/settings-store'
import { useAuthStore } from '@/stores/auth-store'
import type { IncomeRow } from '@/types'

export function useIncomeSheet() {
  const spreadsheetId = useSettingsStore((s) => s.spreadsheetId)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())

  const query = useQuery({
    queryKey: ['income-sheet', spreadsheetId],
    queryFn: () => readSheet(spreadsheetId!, 'income'),
    enabled: isAuthenticated && !!spreadsheetId,
    staleTime: 5 * 60 * 1000,
    select: (rows) => {
      const items = rowsToIncomeObjects(rows)
      const uidMap = new Map<string, { row: IncomeRow; rowIndex: number }>()
      items.forEach((item, i) => {
        uidMap.set(item.ical_uid, { row: item, rowIndex: i + 2 })
      })
      return { items, uidMap }
    },
  })

  return query
}

export function useUpsertIncome() {
  const spreadsheetId = useSettingsStore((s) => s.spreadsheetId)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      income,
      existingRowIndex,
    }: {
      income: IncomeRow
      existingRowIndex?: number
    }) => {
      if (!spreadsheetId) throw new Error('No spreadsheet ID')
      const values = incomeToRow(income)
      if (existingRowIndex) {
        await updateRow(spreadsheetId, `income!A${existingRowIndex}:E${existingRowIndex}`, values)
      } else {
        await appendRow(spreadsheetId, 'income', values)
      }
    },
    onMutate: async ({ income, existingRowIndex }) => {
      await queryClient.cancelQueries({ queryKey: ['income-sheet', spreadsheetId] })
      const previous = queryClient.getQueryData<string[][]>(['income-sheet', spreadsheetId])

      queryClient.setQueryData<string[][]>(['income-sheet', spreadsheetId], (old) => {
        if (!old) return old
        const newRows = [...old.map((r) => [...r])]
        const values = incomeToRow(income)
        if (existingRowIndex) {
          newRows[existingRowIndex - 1] = values
        } else {
          newRows.push(values)
        }
        return newRows
      })

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['income-sheet', spreadsheetId], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['income-sheet', spreadsheetId] })
    },
  })
}
