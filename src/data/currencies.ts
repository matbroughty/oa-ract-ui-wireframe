// Minimal yet broad set of ISO 4217 currency codes for the dropdown.
// Extend as needed.
export const currencyCodes = [
  'GBP','USD','EUR','AUD','CAD','NZD','CHF','JPY','CNY','HKD','SGD','SEK','NOK','DKK','ZAR','INR','BRL','MXN','PLN','CZK','HUF','RON','BGN','HRK','ISK','TRY','AED','SAR','ILS','KRW','TWD','THB','MYR','IDR','PHP'
] as const

export type CurrencyCode = typeof currencyCodes[number]
