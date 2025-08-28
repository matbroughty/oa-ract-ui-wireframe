export type CloudConnection = {
  id: string
  companyName: string
  connector: 'XERO' | 'QB' | 'CODAT' | 'VALIDIS'
  startDate: string // ISO date
  status: 'QUEUED' | 'EXTRACTING'
  waitTime?: number // calculated wait time in minutes
}

// Generate dummy data for cloud connections
export const cloudConnections: CloudConnection[] = [
  {
    id: '1',
    companyName: 'Acme Widgets',
    connector: 'CODAT',
    startDate: '2025-08-15T10:30:00Z',
    status: 'QUEUED'
  },
  {
    id: '2',
    companyName: 'Goode Wood Furniture',
    connector: 'XERO',
    startDate: '2025-08-14T09:15:00Z',
    status: 'EXTRACTING'
  },
  {
    id: '3',
    companyName: 'Lunar Logistics',
    connector: 'VALIDIS',
    startDate: '2025-08-13T14:45:00Z',
    status: 'QUEUED'
  },
  {
    id: '4',
    companyName: 'Birch & Co',
    connector: 'QB',
    startDate: '2025-08-12T11:20:00Z',
    status: 'EXTRACTING'
  },
  {
    id: '5',
    companyName: 'Aurora Media',
    connector: 'XERO',
    startDate: '2025-08-11T16:05:00Z',
    status: 'QUEUED'
  },
  {
    id: '6',
    companyName: 'Falcon Tools',
    connector: 'VALIDIS',
    startDate: '2025-08-10T13:40:00Z',
    status: 'EXTRACTING'
  },
  {
    id: '7',
    companyName: 'Maple Hardware',
    connector: 'CODAT',
    startDate: '2025-08-09T08:55:00Z',
    status: 'QUEUED'
  },
  {
    id: '8',
    companyName: 'Green Leaf Foods',
    connector: 'QB',
    startDate: '2025-08-08T15:30:00Z',
    status: 'EXTRACTING'
  },
  {
    id: '9',
    companyName: 'Nimbus Cloudware',
    connector: 'VALIDIS',
    startDate: '2025-08-07T12:15:00Z',
    status: 'QUEUED'
  },
  {
    id: '10',
    companyName: 'Kensington Books',
    connector: 'CODAT',
    startDate: '2025-08-06T10:00:00Z',
    status: 'QUEUED'
  },
  {
    id: '11',
    companyName: 'Stellar Systems',
    connector: 'XERO',
    startDate: '2025-08-05T14:25:00Z',
    status: 'QUEUED'
  },
  {
    id: '12',
    companyName: 'Quantum Innovations',
    connector: 'QB',
    startDate: '2025-08-04T09:50:00Z',
    status: 'QUEUED'
  }
]