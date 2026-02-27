import { useEffect, useState, type ReactNode } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useSettingsStore } from '@/stores/settings-store'
import { useUIStore } from '@/stores/ui-store'
import { initAuth, requestSilentLogin } from '@/api/google-auth'
import { useTheme } from '@/hooks/useTheme'
import { TopBar } from './TopBar'
import { BottomNav } from './BottomNav'
import { LoginScreen } from '@/components/layout/LoginScreen'
import { SetupWizard } from '@/components/layout/SetupWizard'
import { WorkHoursView } from '@/components/work-hours/WorkHoursView'
import { ExpensesView } from '@/components/expenses/ExpensesView'
import { SummaryView } from '@/components/summary/SummaryView'
import { SettingsView } from '@/components/settings/SettingsView'
import { Toaster } from '@/components/ui/sonner'
import { Spinner } from '@/components/ui/Spinner'

const tabComponents: Record<string, () => ReactNode> = {
  workHours: () => <WorkHoursView />,
  expenses: () => <ExpensesView />,
  summary: () => <SummaryView />,
  settings: () => <SettingsView />,
}

export function AppShell() {
  useTheme()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  const user = useAuthStore((s) => s.user)
  const spreadsheetId = useSettingsStore((s) => s.spreadsheetId)
  const activeTab = useUIStore((s) => s.activeTab)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    try {
      initAuth()
    } catch {
      /* GIS script not loaded yet */
    }

    // If we have a persisted token that's still valid, we're good
    if (isAuthenticated && user) {
      setAuthChecked(true)
      return
    }

    // If we had a token but it expired, try silent re-auth
    const { accessToken } = useAuthStore.getState()
    if (accessToken || user) {
      try {
        requestSilentLogin()
      } catch {
        /* silent login failed */
      }
      // Give silent login a moment to complete
      const timer = setTimeout(() => setAuthChecked(true), 1500)
      return () => clearTimeout(timer)
    }

    // No previous session at all
    setAuthChecked(true)
  }, [])

  // Once auth succeeds (e.g. from silent login callback), mark as checked
  useEffect(() => {
    if (isAuthenticated && !authChecked) {
      setAuthChecked(true)
    }
  }, [isAuthenticated, authChecked])

  if (!authChecked) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!isAuthenticated) return <LoginScreen />
  if (!spreadsheetId) return <SetupWizard />

  return (
    <div className="flex h-full w-full flex-col">
      <TopBar />
      <main className="mx-auto flex-1 w-full max-w-2xl overflow-y-auto">
        {tabComponents[activeTab]?.()}
      </main>
      <BottomNav />
      <Toaster />
    </div>
  )
}
