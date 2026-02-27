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
    <nav className="sticky bottom-0 z-10 md:px-4 md:pb-2">
      <div className="mx-auto max-w-2xl">
        <div className="glass-nav relative overflow-hidden md:rounded-2xl">
          <div className="absolute top-0 left-0 right-0 h-[2px] gradient-emerald opacity-50" />
          <div className="flex h-16 items-center justify-around">
            {tabs.map(({ id, icon: Icon, labelKey }) => {
              const active = activeTab === id
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex flex-1 flex-col items-center gap-0.5 py-1 text-xs transition-colors ${
                    active
                      ? 'text-primary-700 dark:text-primary-300 font-medium'
                      : 'text-primary-600 dark:text-primary-500'
                  }`}
                >
                  <div className="relative flex flex-col items-center">
                    {active && (
                      <div className="absolute -top-2 h-[2px] w-6 rounded-full gradient-emerald glow-emerald-sm" />
                    )}
                    <Icon
                      size={22}
                      strokeWidth={active ? 2.5 : 2}
                    />
                  </div>
                  <span>{t(labelKey)}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
