import { ErrorBoundary } from '@/components/layout/ErrorBoundary'
import { AppShell } from '@/components/layout/AppShell'

export default function App() {
  return (
    <ErrorBoundary>
      <AppShell />
    </ErrorBoundary>
  )
}
