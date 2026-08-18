export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatHourlyRate(amount: number): string {
  return `${formatCurrency(amount)}/hr`
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function lineItemsTotal(items: { quantity: number; unitPrice: number }[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function generateNumber(prefix: string, count: number): string {
  return `${prefix}-${String(count + 1).padStart(4, '0')}`
}
