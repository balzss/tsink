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
    <header className="sticky top-0 z-10 flex h-14 items-center glass-nav border-b-0 px-4 relative">
      <h1 className="text-lg font-semibold text-primary-900 dark:text-primary-100">
        {t(tabTitleKeys[activeTab])}
      </h1>
      <div className="absolute bottom-0 left-0 right-0 h-[2px] gradient-emerald opacity-60" />
    </header>
  )
}
