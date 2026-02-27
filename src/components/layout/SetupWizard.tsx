import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '@/stores/settings-store'
import { SpreadsheetPicker } from '@/components/ui/SpreadsheetPicker'

export function SetupWizard() {
  const { t } = useTranslation()
  const setSpreadsheetId = useSettingsStore((s) => s.setSpreadsheetId)

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-6 gradient-bg">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">{t('setup.title')}</h1>
        <p className="mt-2 text-white/70">{t('setup.subtitle')}</p>
      </div>
      <div className="glass rounded-2xl p-6 w-full max-w-sm">
        <SpreadsheetPicker onSelect={setSpreadsheetId} />
      </div>
    </div>
  )
}
