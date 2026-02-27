import { create } from 'zustand'

export type Tab = 'workHours' | 'expenses' | 'summary' | 'settings'

interface UIState {
  activeTab: Tab
  setActiveTab: (tab: Tab) => void
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'workHours',
  setActiveTab: (tab) => set({ activeTab: tab }),
}))
