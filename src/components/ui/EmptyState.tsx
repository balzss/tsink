import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="mb-3 text-primary-400 dark:text-primary-600">{icon}</div>}
      <p className="text-sm font-medium text-primary-600 dark:text-primary-400">{title}</p>
      {description && <p className="mt-1 text-xs text-primary-600 dark:text-primary-500">{description}</p>}
    </div>
  )
}
