import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { useSettingsStore } from '@/stores/settings-store'
import { useConfigSheet, useUpdateCategories } from '@/hooks/useConfigSheet'
import { logout } from '@/api/google-auth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SpreadsheetPicker } from '@/components/ui/SpreadsheetPicker'
import { CURRENCIES } from '@/utils/currency'
import { LogOut, Plus, X, Download, Upload, FileSpreadsheet } from 'lucide-react'

export function SettingsView() {
  const { t, i18n } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const settings = useSettingsStore()
  const { data: categories } = useConfigSheet()
  const updateCategories = useUpdateCategories()
  const [newCategory, setNewCategory] = useState('')
  const [showChangeSheet, setShowChangeSheet] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleAddCategory() {
    if (!newCategory.trim() || !categories) return
    updateCategories.mutate([...categories, newCategory.trim()])
    setNewCategory('')
  }

  function handleRemoveCategory(cat: string) {
    if (!categories) return
    updateCategories.mutate(categories.filter((c) => c !== cat))
  }

  function handleExport() {
    const data = {
      settings: useSettingsStore.getState(),
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tsink-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(t('settings.exportSuccess'))
  }

  function handleImport() {
    fileInputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!confirm(t('settings.importConfirm'))) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        if (data.settings) {
          const s = data.settings
          if (s.spreadsheetId) settings.setSpreadsheetId(s.spreadsheetId)
          if (s.calendarId) settings.setCalendarId(s.calendarId)
          if (s.currency) settings.setCurrency(s.currency)
          if (s.theme) settings.setTheme(s.theme)
          if (s.language) settings.setLanguage(s.language)
        }
        toast.success(t('settings.importSuccess'))
      } catch {
        toast.error(t('common.error'))
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="flex flex-col gap-6 p-4 pb-8">
      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">
          {t('settings.account')}
        </h2>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {user?.picture && (
                <img src={user.picture} alt="" className="h-10 w-10 rounded-full" referrerPolicy="no-referrer" />
              )}
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium text-primary-900 dark:text-primary-100">{user?.name}</p>
                <p className="truncate text-sm text-primary-600 dark:text-primary-400">{user?.email}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut size={16} className="mr-1" /> {t('settings.signOut')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">
          {t('settings.spreadsheet')}
        </h2>
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <FileSpreadsheet size={16} className="text-primary-600 dark:text-primary-400 shrink-0" />
              <span className="text-primary-600 dark:text-primary-400 break-all text-xs">{settings.spreadsheetId}</span>
            </div>
            <div className="flex flex-col gap-1">
              <Label>{t('settings.calendarId')}</Label>
              <Input
                value={settings.calendarId}
                placeholder={t('settings.calendarPlaceholder')}
                onChange={(e) => settings.setCalendarId(e.target.value)}
              />
            </div>
            {!showChangeSheet ? (
              <Button variant="ghost" size="sm" onClick={() => setShowChangeSheet(true)}>
                {t('settings.changeSpreadsheet')}
              </Button>
            ) : (
              <div className="space-y-2">
                <SpreadsheetPicker onSelect={(id) => { settings.setSpreadsheetId(id); setShowChangeSheet(false); toast.success(t('settings.importSuccess')) }} />
                <Button variant="ghost" size="sm" className="w-full" onClick={() => setShowChangeSheet(false)}>
                  {t('common.cancel')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">
          {t('settings.appearance')}
        </h2>
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-col gap-1">
              <Label>{t('settings.theme')}</Label>
              <Select value={settings.theme} onValueChange={(value) => settings.setTheme(value as 'light' | 'dark' | 'system')}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">{t('settings.light')}</SelectItem>
                  <SelectItem value="dark">{t('settings.dark')}</SelectItem>
                  <SelectItem value="system">{t('settings.system')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <Label>{t('settings.language')}</Label>
              <Select value={i18n.language} onValueChange={(value) => { settings.setLanguage(value); i18n.changeLanguage(value) }}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hu">Magyar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">
          {t('settings.data')}
        </h2>
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-col gap-1">
              <Label>{t('settings.currency')}</Label>
              <Select value={settings.currency} onValueChange={(value) => settings.setCurrency(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((cur) => (
                    <SelectItem key={cur.code} value={cur.code}>{cur.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2">{t('settings.categories')}</Label>
              <div className="flex flex-wrap gap-2">
                {(categories ?? []).map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-sm dark:bg-primary-800"
                  >
                    {cat}
                    <button onClick={() => handleRemoveCategory(cat)} className="text-primary-500 hover:text-primary-700">
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder={t('settings.categoryPlaceholder')}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                  className="flex-1"
                />
                <Button onClick={handleAddCategory} disabled={!newCategory.trim()}>
                  <Plus size={16} />
                </Button>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="secondary" className="flex-1" onClick={handleExport}>
                <Download size={16} className="mr-2" /> {t('settings.exportData')}
              </Button>
              <Button variant="secondary" className="flex-1" onClick={handleImport}>
                <Upload size={16} className="mr-2" /> {t('settings.importData')}
              </Button>
              <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileChange} />
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
