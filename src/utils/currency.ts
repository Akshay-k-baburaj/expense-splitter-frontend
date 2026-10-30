export const supportedCurrencies = [
  { code: 'INR', name: 'Indian rupee' },
  { code: 'USD', name: 'US dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'Pound sterling' },
  { code: 'AUD', name: 'Australian dollar' },
  { code: 'CAD', name: 'Canadian dollar' },
  { code: 'JPY', name: 'Japanese yen' },
  { code: 'CNY', name: 'Chinese yuan' },
  { code: 'CHF', name: 'Swiss franc' },
  { code: 'SGD', name: 'Singapore dollar' },
  { code: 'NZD', name: 'New Zealand dollar' },
  { code: 'AED', name: 'UAE dirham' },
  { code: 'KWD', name: 'Kuwaiti dinar' },
  { code: 'BHD', name: 'Bahraini dinar' },
  { code: 'KRW', name: 'South Korean won' },
] as const;

export function currencyFractionDigits(currency: string): number {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? 2;
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);
}

export function currencySymbol(currency: string): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 })
    .formatToParts(0).find((part) => part.type === 'currency')?.value ?? currency;
}
