export const eur = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
export const eurExact = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' })
export const shortDate = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
export const RISK_LABEL: Record<string, string> = {
  cautious: 'Cautious',
  balanced: 'Balanced',
  dynamic: 'Dynamic',
}
