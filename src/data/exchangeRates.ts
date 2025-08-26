import { CurrencyCode } from './currencies'

export type ExchangeRate = {
  id: string
  fromCurrency: CurrencyCode
  toCurrency: CurrencyCode
  rate: number
  lastUpdated: string // ISO date
  source: 'manual' | 'lendscape' | 'openexchangerates'
}

// Generate dummy data for exchange rates
export const exchangeRates: ExchangeRate[] = [
  {
    id: '1',
    fromCurrency: 'GBP',
    toCurrency: 'USD',
    rate: 1.27,
    lastUpdated: '2025-08-15T10:30:00Z',
    source: 'manual'
  },
  {
    id: '2',
    fromCurrency: 'GBP',
    toCurrency: 'EUR',
    rate: 1.17,
    lastUpdated: '2025-08-15T10:30:00Z',
    source: 'manual'
  },
  {
    id: '3',
    fromCurrency: 'USD',
    toCurrency: 'GBP',
    rate: 0.79,
    lastUpdated: '2025-08-14T09:15:00Z',
    source: 'lendscape'
  },
  {
    id: '4',
    fromCurrency: 'USD',
    toCurrency: 'EUR',
    rate: 0.92,
    lastUpdated: '2025-08-14T09:15:00Z',
    source: 'lendscape'
  },
  {
    id: '5',
    fromCurrency: 'EUR',
    toCurrency: 'GBP',
    rate: 0.86,
    lastUpdated: '2025-08-13T14:45:00Z',
    source: 'openexchangerates'
  },
  {
    id: '6',
    fromCurrency: 'EUR',
    toCurrency: 'USD',
    rate: 1.09,
    lastUpdated: '2025-08-13T14:45:00Z',
    source: 'openexchangerates'
  },
  {
    id: '7',
    fromCurrency: 'GBP',
    toCurrency: 'CAD',
    rate: 1.72,
    lastUpdated: '2025-08-12T11:20:00Z',
    source: 'manual'
  },
  {
    id: '8',
    fromCurrency: 'GBP',
    toCurrency: 'AUD',
    rate: 1.92,
    lastUpdated: '2025-08-11T16:05:00Z',
    source: 'lendscape'
  },
  {
    id: '9',
    fromCurrency: 'USD',
    toCurrency: 'JPY',
    rate: 149.82,
    lastUpdated: '2025-08-10T13:40:00Z',
    source: 'openexchangerates'
  },
  {
    id: '10',
    fromCurrency: 'EUR',
    toCurrency: 'CHF',
    rate: 0.96,
    lastUpdated: '2025-08-09T08:55:00Z',
    source: 'manual'
  }
]