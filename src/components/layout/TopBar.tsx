import { useTranslation } from 'react-i18next'
import { useUIStore, type Tab } from '@/stores/ui-store'

const tabTitleKeys: Record<Tab, string> = {
  workHours: 'workHours.title',
  expenses: 'expenses.title',
  summary: 'summary.title',
  settings: 'settings.title',
}

export function TopBar() {
  const { t } = useTranslation()
  const activeTab = useUIStore((s) => s.activeTab)

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center border-b border-primary-200 bg-white/80 px-4 backdrop-blur-md dark:border-primary-800 dark:bg-primary-950/80">
      <h1 className="text-lg font-semibold text-primary-900 dark:text-primary-100">
        {t(tabTitleKeys[activeTab])}
      </h1>
    </header>
  )
}
