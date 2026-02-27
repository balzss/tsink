import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { listSpreadsheets, initializeSpreadsheet } from '@/api/google-sheets'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Spinner } from '@/components/ui/Spinner'
import { FileSpreadsheet, Plus, Link } from 'lucide-react'

interface SpreadsheetPickerProps {
  onSelect: (id: string) => void
}

interface SpreadsheetFile {
  id: string
  name: string
  modifiedTime: string
}

function extractSpreadsheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
  return match?.[1] ?? null
}

export function SpreadsheetPicker({ onSelect }: SpreadsheetPickerProps) {
  const { t } = useTranslation()
  const [files, setFiles] = useState<SpreadsheetFile[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadFiles()
  }, [])

  async function loadFiles() {
    setLoading(true)
    setError('')
    try {
      const result = await listSpreadsheets()
      setFiles(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load spreadsheets')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    setCreating(true)
    setError('')
    try {
      const id = await initializeSpreadsheet('tsink')
      onSelect(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create spreadsheet')
    } finally {
      setCreating(false)
    }
  }

  function handlePasteSubmit() {
    const id = extractSpreadsheetId(url)
    if (id) {
      onSelect(id)
    } else {
      setError(t('setup.invalidUrl'))
    }
  }

  function formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return iso
    }
  }

  return (
    <div className="w-full space-y-4">
      <Tabs defaultValue="browse">
        <TabsList className="w-full">
          <TabsTrigger value="browse" className="flex-1 min-w-0 truncate">
            <FileSpreadsheet size={14} className="mr-1 shrink-0" />
            <span className="truncate">{t('setup.browseExisting')}</span>
          </TabsTrigger>
          <TabsTrigger value="paste" className="flex-1 min-w-0 truncate">
            <Link size={14} className="mr-1 shrink-0" />
            <span className="truncate">{t('setup.pasteUrl')}</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="browse">
          <div className="space-y-2 pt-2">
            {loading ? (
              <div className="flex justify-center py-6">
                <Spinner />
              </div>
            ) : files.length === 0 ? (
              <p className="py-4 text-center text-sm text-primary-600 dark:text-primary-400">
                {t('setup.noSpreadsheets')}
              </p>
            ) : (
              <div className="max-h-60 space-y-1.5 overflow-y-auto">
                {files.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => onSelect(file.id)}
                    className="flex w-full items-center gap-3 rounded-xl border border-primary-200 bg-white p-3 text-left transition-colors hover:border-primary-400 hover:bg-primary-50 dark:border-primary-700 dark:bg-primary-800 dark:hover:border-primary-600 dark:hover:bg-primary-800/80"
                  >
                    <FileSpreadsheet size={18} className="shrink-0 text-primary-600 dark:text-primary-400" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-primary-900 dark:text-primary-100">
                        {file.name}
                      </p>
                      <p className="text-xs text-primary-600 dark:text-primary-500">
                        {formatDate(file.modifiedTime)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="paste">
          <div className="space-y-3 pt-2">
            <div className="flex flex-col gap-1">
              <Label>{t('setup.pasteUrl')}</Label>
              <Input
                placeholder={t('setup.urlPlaceholder')}
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError('') }}
              />
            </div>
            <Button className="w-full" onClick={handlePasteSubmit} disabled={!url.trim()}>
              {t('setup.continue')}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex items-center gap-3 text-sm text-primary-900 dark:text-primary-200">
        <div className="h-px flex-1 bg-primary-300 dark:bg-primary-600" />
        {t('setup.orCreate')}
        <div className="h-px flex-1 bg-primary-300 dark:bg-primary-600" />
      </div>

      <Button variant="secondary" className="w-full" onClick={handleCreate} disabled={creating}>
        {creating ? <><Spinner className="mr-2" /> {t('setup.creating')}</> : <><Plus size={16} className="mr-2" /> {t('setup.createNew')}</>}
      </Button>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
