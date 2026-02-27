import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { readSheet, updateRow } from '@/api/google-sheets'
import { parseConfigCategories } from '@/api/sheets-helpers'
import { useSettingsStore } from '@/stores/settings-store'
import { useAuthStore } from '@/stores/auth-store'

export function useConfigSheet() {
  const spreadsheetId = useSettingsStore((s) => s.spreadsheetId)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())

  return useQuery({
    queryKey: ['config-sheet', spreadsheetId],
    queryFn: () => readSheet(spreadsheetId!, 'config'),
    enabled: isAuthenticated && !!spreadsheetId,
    staleTime: 5 * 60 * 1000,
    select: parseConfigCategories,
  })
}

export function useUpdateCategories() {
  const spreadsheetId = useSettingsStore((s) => s.spreadsheetId)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (categories: string[]) => {
      if (!spreadsheetId) throw new Error('No spreadsheet ID')
      await updateRow(spreadsheetId, 'config!A2:B2', [
        'categories',
        JSON.stringify(categories),
      ])
    },
    onMutate: async (categories) => {
      await queryClient.cancelQueries({ queryKey: ['config-sheet', spreadsheetId] })
      const previous = queryClient.getQueryData<string[][]>(['config-sheet', spreadsheetId])

      queryClient.setQueryData<string[][]>(['config-sheet', spreadsheetId], (old) => {
        if (!old) return [['key', 'value'], ['categories', JSON.stringify(categories)]]
        const newRows = [...old.map((r) => [...r])]
        const idx = newRows.findIndex((r) => r[0] === 'categories')
        if (idx >= 0) {
          newRows[idx] = ['categories', JSON.stringify(categories)]
        }
        return newRows
      })

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['config-sheet', spreadsheetId], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['config-sheet', spreadsheetId] })
    },
  })
}
