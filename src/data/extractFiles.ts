export type ExtractFile = {
  id: string
  companyName: string
  connector: 'native' | 'codat' | 'validis'
  receivedDate: string // ISO date
  status: 'queued' | 'loading' | 'loaded' | 'failed'
  errorMessage?: string
  size: 'SMALL' | 'MEDIUM' | 'LARGE' | 'X-LARGE'
  waitTime?: number // calculated wait time in minutes
}

// Generate dummy data for extract files
export const extractFiles: ExtractFile[] = [
  {
    id: '1',
    companyName: 'Acme Widgets',
    connector: 'codat',
    receivedDate: '2025-08-15T10:30:00Z',
    status: 'queued',
    size: 'SMALL'
  },
  {
    id: '2',
    companyName: 'Goode Wood Furniture',
    connector: 'native',
    receivedDate: '2025-08-14T09:15:00Z',
    status: 'loading',
    size: 'MEDIUM'
  },
  {
    id: '3',
    companyName: 'Lunar Logistics',
    connector: 'validis',
    receivedDate: '2025-08-13T14:45:00Z',
    status: 'loaded',
    size: 'LARGE'
  },
  {
    id: '4',
    companyName: 'Birch & Co',
    connector: 'codat',
    receivedDate: '2025-08-12T11:20:00Z',
    status: 'failed',
    errorMessage: 'Missing currency',
    size: 'X-LARGE'
  },
  {
    id: '5',
    companyName: 'Aurora Media',
    connector: 'native',
    receivedDate: '2025-08-11T16:05:00Z',
    status: 'queued',
    size: 'SMALL'
  },
  {
    id: '6',
    companyName: 'Falcon Tools',
    connector: 'validis',
    receivedDate: '2025-08-10T13:40:00Z',
    status: 'loading',
    size: 'MEDIUM'
  },
  {
    id: '7',
    companyName: 'Maple Hardware',
    connector: 'codat',
    receivedDate: '2025-08-09T08:55:00Z',
    status: 'loaded',
    size: 'LARGE'
  },
  {
    id: '8',
    companyName: 'Green Leaf Foods',
    connector: 'native',
    receivedDate: '2025-08-08T15:30:00Z',
    status: 'failed',
    errorMessage: 'Invalid data format',
    size: 'X-LARGE'
  },
  {
    id: '9',
    companyName: 'Nimbus Cloudware',
    connector: 'validis',
    receivedDate: '2025-08-07T12:15:00Z',
    status: 'queued',
    size: 'SMALL'
  },
  {
    id: '10',
    companyName: 'Kensington Books',
    connector: 'codat',
    receivedDate: '2025-08-06T10:00:00Z',
    status: 'loading',
    size: 'LARGE'
  }
]
