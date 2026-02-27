import { useTranslation } from 'react-i18next'
import { Clock, Receipt, BarChart3, Settings } from 'lucide-react'
import { useUIStore, type Tab } from '@/stores/ui-store'

const tabs: { id: Tab; icon: typeof Clock; labelKey: string }[] = [
  { id: 'workHours', icon: Clock, labelKey: 'tabs.workHours' },
  { id: 'expenses', icon: Receipt, labelKey: 'tabs.expenses' },
  { id: 'summary', icon: BarChart3, labelKey: 'tabs.summary' },
  { id: 'settings', icon: Settings, labelKey: 'tabs.settings' },
]

export function BottomNav() {
  const { t } = useTranslation()
  const activeTab = useUIStore((s) => s.activeTab)
  const setActiveTab = useUIStore((s) => s.setActiveTab)

  return (
    <nav className="sticky bottom-0 z-10 flex h-16 items-center justify-around border-t border-primary-200 bg-white dark:border-primary-800 dark:bg-primary-950">
      {tabs.map(({ id, icon: Icon, labelKey }) => {
        const active = activeTab === id
        return (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex flex-1 flex-col items-center gap-0.5 py-1 text-xs transition-colors ${
              active
                ? 'text-primary-900 dark:text-primary-100'
                : 'text-primary-400 dark:text-primary-500'
            }`}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 2} />
            <span>{t(labelKey)}</span>
          </button>
        )
      })}
    </nav>
  )
}
