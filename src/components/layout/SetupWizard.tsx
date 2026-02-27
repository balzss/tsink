import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '@/stores/settings-store'
import { SpreadsheetPicker } from '@/components/ui/SpreadsheetPicker'

export function SetupWizard() {
  const { t } = useTranslation()
  const setSpreadsheetId = useSettingsStore((s) => s.setSpreadsheetId)

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-primary-900 dark:text-primary-100">{t('setup.title')}</h1>
        <p className="mt-2 text-primary-500 dark:text-primary-400">{t('setup.subtitle')}</p>
      </div>
      <SpreadsheetPicker onSelect={setSpreadsheetId} />
    </div>
  )
}
