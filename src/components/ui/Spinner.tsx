export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary-500 border-t-transparent ${className}`} role="status">
      <span className="sr-only">Loading...</span>
    </div>
  )
}
