export interface CurrencyConfig {
  code: string
  symbol: string
  position: 'before' | 'after'
  label: string
}

export const CURRENCIES: CurrencyConfig[] = [
  { code: 'HUF', symbol: 'Ft', position: 'after', label: 'HUF (Ft)' },
  { code: 'EUR', symbol: '€', position: 'before', label: 'EUR (€)' },
  { code: 'USD', symbol: '$', position: 'before', label: 'USD ($)' },
  { code: 'GBP', symbol: '£', position: 'before', label: 'GBP (£)' },
]

export function getCurrencyConfig(code: string): CurrencyConfig {
  return CURRENCIES.find((c) => c.code === code) ?? { code, symbol: code, position: 'after', label: code }
}

export function getCurrencySymbol(code: string): string {
  return getCurrencyConfig(code).symbol
}

export function formatCurrency(amount: number, currency: string): string {
  const config = getCurrencyConfig(currency)
  const formatted = amount.toLocaleString(undefined, { maximumFractionDigits: 0 })
  if (config.position === 'before') {
    return `${config.symbol}${formatted}`
  }
  return `${formatted} ${config.symbol}`
}
