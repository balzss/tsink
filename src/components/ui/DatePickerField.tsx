import { useState } from 'react'
import { Calendar } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { DatePicker } from './DatePicker'

interface DatePickerFieldProps {
  label?: string
  value: string // ISO date string (YYYY-MM-DD)
  onChange: (value: string) => void
}

function parseDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function DatePickerField({ label, value, onChange }: DatePickerFieldProps) {
  const [open, setOpen] = useState(false)
  const dateObj = value ? parseDate(value) : new Date()

  const displayText = value
    ? dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : ''

  return (
    <div className="flex flex-col gap-1">
      {label && <Label>{label}</Label>}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="border-input flex w-full items-center justify-between rounded-md border bg-transparent px-3 py-2 text-left text-sm shadow-xs transition-colors hover:border-primary-400 dark:text-primary-100"
        >
          <span className={value ? '' : 'text-muted-foreground'}>{displayText || '\u00A0'}</span>
          <Calendar size={14} className="text-muted-foreground" />
        </button>
        <DatePicker
          value={dateObj}
          onChange={(d) => { onChange(formatDate(d)); setOpen(false) }}
          open={open}
          onClose={() => setOpen(false)}
        />
      </div>
    </div>
  )
}
