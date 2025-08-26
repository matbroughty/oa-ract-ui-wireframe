export type ExtractFile = {
  id: string
  companyName: string
  connector: 'native' | 'codat' | 'validis'
  receivedDate: string // ISO date
  status: 'queued' | 'loading' | 'loaded' | 'failed'
  errorMessage?: string
}

// Generate dummy data for extract files
export const extractFiles: ExtractFile[] = [
  {
    id: '1',
    companyName: 'Acme Widgets',
    connector: 'codat',
    receivedDate: '2025-08-15T10:30:00Z',
    status: 'queued'
  },
  {
    id: '2',
    companyName: 'Goode Wood Furniture',
    connector: 'native',
    receivedDate: '2025-08-14T09:15:00Z',
    status: 'loading'
  },
  {
    id: '3',
    companyName: 'Lunar Logistics',
    connector: 'validis',
    receivedDate: '2025-08-13T14:45:00Z',
    status: 'loaded'
  },
  {
    id: '4',
    companyName: 'Birch & Co',
    connector: 'codat',
    receivedDate: '2025-08-12T11:20:00Z',
    status: 'failed',
    errorMessage: 'Missing currency'
  },
  {
    id: '5',
    companyName: 'Aurora Media',
    connector: 'native',
    receivedDate: '2025-08-11T16:05:00Z',
    status: 'queued'
  },
  {
    id: '6',
    companyName: 'Falcon Tools',
    connector: 'validis',
    receivedDate: '2025-08-10T13:40:00Z',
    status: 'loading'
  },
  {
    id: '7',
    companyName: 'Maple Hardware',
    connector: 'codat',
    receivedDate: '2025-08-09T08:55:00Z',
    status: 'loaded'
  },
  {
    id: '8',
    companyName: 'Green Leaf Foods',
    connector: 'native',
    receivedDate: '2025-08-08T15:30:00Z',
    status: 'failed',
    errorMessage: 'Invalid data format'
  },
  {
    id: '9',
    companyName: 'Nimbus Cloudware',
    connector: 'validis',
    receivedDate: '2025-08-07T12:15:00Z',
    status: 'queued'
  },
  {
    id: '10',
    companyName: 'Kensington Books',
    connector: 'codat',
    receivedDate: '2025-08-06T10:00:00Z',
    status: 'loading'
  }
]