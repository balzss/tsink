import { getAuthHeaders } from './google-auth'

const BASE = 'https://sheets.googleapis.com/v4/spreadsheets'

export async function readSheet(
  spreadsheetId: string,
  range: string
): Promise<string[][]> {
  const headers = await getAuthHeaders()
  const res = await fetch(
    `${BASE}/${spreadsheetId}/values/${encodeURIComponent(range)}`,
    { headers }
  )
  if (!res.ok) throw new Error(`Sheets read error: ${res.status}`)
  const data = await res.json()
  return data.values ?? []
}

export async function appendRow(
  spreadsheetId: string,
  sheet: string,
  values: string[]
): Promise<void> {
  const headers = await getAuthHeaders()
  const res = await fetch(
    `${BASE}/${spreadsheetId}/values/${encodeURIComponent(sheet)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: [values] }),
    }
  )
  if (!res.ok) throw new Error(`Sheets append error: ${res.status}`)
}

export async function updateRow(
  spreadsheetId: string,
  range: string,
  values: string[]
): Promise<void> {
  const headers = await getAuthHeaders()
  const res = await fetch(
    `${BASE}/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`,
    {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: [values] }),
    }
  )
  if (!res.ok) throw new Error(`Sheets update error: ${res.status}`)
}

export async function deleteRow(
  spreadsheetId: string,
  sheetId: number,
  rowIndex: number
): Promise<void> {
  const headers = await getAuthHeaders()
  const res = await fetch(`${BASE}/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex,
              endIndex: rowIndex + 1,
            },
          },
        },
      ],
    }),
  })
  if (!res.ok) throw new Error(`Sheets delete error: ${res.status}`)
}

interface SheetProperties {
  sheets: Array<{ properties: { title: string; sheetId: number } }>
}

export async function getSheetIds(
  spreadsheetId: string
): Promise<Record<string, number>> {
  const headers = await getAuthHeaders()
  const res = await fetch(
    `${BASE}/${spreadsheetId}?fields=sheets.properties`,
    { headers }
  )
  if (!res.ok) throw new Error(`Sheets metadata error: ${res.status}`)
  const data: SheetProperties = await res.json()
  const map: Record<string, number> = {}
  for (const s of data.sheets) {
    map[s.properties.title] = s.properties.sheetId
  }
  return map
}

export async function initializeSpreadsheet(title: string): Promise<string> {
  const headers = await getAuthHeaders()
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      properties: { title },
      sheets: [
        {
          properties: { title: 'income' },
          data: [
            {
              rowData: [
                {
                  values: [
                    { userEnteredValue: { stringValue: 'ical_uid' } },
                    { userEnteredValue: { stringValue: 'date' } },
                    { userEnteredValue: { stringValue: 'amount' } },
                    { userEnteredValue: { stringValue: 'category' } },
                    { userEnteredValue: { stringValue: 'is_skipped' } },
                  ],
                },
              ],
            },
          ],
        },
        {
          properties: { title: 'expenses' },
          data: [
            {
              rowData: [
                {
                  values: [
                    { userEnteredValue: { stringValue: 'id' } },
                    { userEnteredValue: { stringValue: 'name' } },
                    { userEnteredValue: { stringValue: 'date' } },
                    { userEnteredValue: { stringValue: 'amount' } },
                    { userEnteredValue: { stringValue: 'is_recurring' } },
                  ],
                },
              ],
            },
          ],
        },
        {
          properties: { title: 'config' },
          data: [
            {
              rowData: [
                {
                  values: [
                    { userEnteredValue: { stringValue: 'key' } },
                    { userEnteredValue: { stringValue: 'value' } },
                  ],
                },
                {
                  values: [
                    { userEnteredValue: { stringValue: 'categories' } },
                    { userEnteredValue: { stringValue: '["General"]' } },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }),
  })
  if (!res.ok) throw new Error(`Sheets create error: ${res.status}`)
  const data = await res.json()
  return data.spreadsheetId
}

export async function listSpreadsheets(): Promise<Array<{ id: string; name: string; modifiedTime: string }>> {
  const headers = await getAuthHeaders()
  const params = new URLSearchParams({
    q: "mimeType='application/vnd.google-apps.spreadsheet'",
    fields: 'files(id,name,modifiedTime)',
    orderBy: 'modifiedTime desc',
    pageSize: '20',
  })
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?${params}`,
    { headers }
  )
  if (!res.ok) throw new Error(`Drive API error: ${res.status}`)
  const data = await res.json()
  return data.files ?? []
}
