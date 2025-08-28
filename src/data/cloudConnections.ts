export type CloudConnection = {
  id: string
  companyName: string
  connector: 'XERO' | 'QB' | 'CODAT' | 'VALIDIS'
  startDate: string // ISO date
  status: 'QUEUED' | 'EXTRACTING'
  waitTime?: number // calculated wait time in minutes
}

// Generate dummy data for cloud connections
// Function to generate a random start date within the current hour
function generateStartDate(minutesAgo: number): string {
  const now = new Date();
  // Subtract random minutes (1-60) from current time
  now.setMinutes(now.getMinutes() - minutesAgo);
  return now.toISOString();
}

export const cloudConnections: CloudConnection[] = [
  {
    id: '1',
    companyName: 'Acme Widgets',
    connector: 'CODAT',
    startDate: generateStartDate(5), // 5 minutes ago
    status: 'QUEUED'
  },
  {
    id: '2',
    companyName: 'Goode Wood Furniture',
    connector: 'XERO',
    startDate: generateStartDate(12), // 12 minutes ago
    status: 'EXTRACTING'
  },
  {
    id: '3',
    companyName: 'Lunar Logistics',
    connector: 'VALIDIS',
    startDate: generateStartDate(18), // 18 minutes ago
    status: 'QUEUED'
  },
  {
    id: '4',
    companyName: 'Birch & Co',
    connector: 'QB',
    startDate: generateStartDate(25), // 25 minutes ago
    status: 'EXTRACTING'
  },
  {
    id: '5',
    companyName: 'Aurora Media',
    connector: 'XERO',
    startDate: generateStartDate(30), // 30 minutes ago
    status: 'QUEUED'
  },
  {
    id: '6',
    companyName: 'Falcon Tools',
    connector: 'VALIDIS',
    startDate: generateStartDate(35), // 35 minutes ago
    status: 'EXTRACTING'
  },
  {
    id: '7',
    companyName: 'Maple Hardware',
    connector: 'CODAT',
    startDate: generateStartDate(40), // 40 minutes ago
    status: 'QUEUED'
  },
  {
    id: '8',
    companyName: 'Green Leaf Foods',
    connector: 'QB',
    startDate: generateStartDate(45), // 45 minutes ago
    status: 'EXTRACTING'
  },
  {
    id: '9',
    companyName: 'Nimbus Cloudware',
    connector: 'VALIDIS',
    startDate: generateStartDate(50), // 50 minutes ago
    status: 'QUEUED'
  },
  {
    id: '10',
    companyName: 'Kensington Books',
    connector: 'CODAT',
    startDate: generateStartDate(52), // 52 minutes ago
    status: 'QUEUED'
  },
  {
    id: '11',
    companyName: 'Stellar Systems',
    connector: 'XERO',
    startDate: generateStartDate(55), // 55 minutes ago
    status: 'QUEUED'
  },
  {
    id: '12',
    companyName: 'Quantum Innovations',
    connector: 'QB',
    startDate: generateStartDate(58), // 58 minutes ago
    status: 'QUEUED'
  }
]
