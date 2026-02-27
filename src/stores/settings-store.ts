import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

interface SettingsState {
  spreadsheetId: string | null
  calendarId: string
  currency: string
  theme: Theme
  language: string
  setSpreadsheetId: (id: string | null) => void
  setCalendarId: (id: string) => void
  setCurrency: (currency: string) => void
  setTheme: (theme: Theme) => void
  setLanguage: (language: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      spreadsheetId: null,
      calendarId: 'primary',
      currency: 'HUF',
      theme: 'system',
      language: 'en',
      setSpreadsheetId: (id) => set({ spreadsheetId: id }),
      setCalendarId: (id) => set({ calendarId: id }),
      setCurrency: (currency) => set({ currency }),
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
    }),
    { name: 'tsink-settings' }
  )
)
