export type ConfigOption = {
  id: string
  name: string
  value: string
  description: string
  lastUpdated: string // ISO date
}

// Generate dummy data for configuration options
export const configOptions: ConfigOption[] = [
  {
    id: '1',
    name: 'default-currency',
    value: 'GBP',
    description: 'Default currency used throughout the application',
    lastUpdated: '2025-08-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'service-company-name',
    value: '45 Finance',
    description: 'Name of the service company',
    lastUpdated: '2025-08-14T09:15:00Z'
  },
  {
    id: '3',
    name: 'oa-external-url',
    value: 'https://demo.oa.lendscape.cloud/external',
    description: 'External URL for Open Accounting',
    lastUpdated: '2025-08-13T14:45:00Z'
  },
  {
    id: '4',
    name: 'default-funding-type',
    value: 'Company',
    description: 'Default funding type for new companies',
    lastUpdated: '2025-08-12T11:20:00Z'
  },
  {
    id: '5',
    name: 'enable-notifications',
    value: 'true',
    description: 'Enable email notifications',
    lastUpdated: '2025-08-11T16:05:00Z'
  },
  {
    id: '6',
    name: 'notification-email',
    value: 'admin@example.com',
    description: 'Email address for system notifications',
    lastUpdated: '2025-08-10T13:40:00Z'
  },
  {
    id: '7',
    name: 'data-retention-days',
    value: '90',
    description: 'Number of days to retain data',
    lastUpdated: '2025-08-09T08:55:00Z'
  },
  {
    id: '8',
    name: 'api-timeout-seconds',
    value: '30',
    description: 'Timeout for API requests in seconds',
    lastUpdated: '2025-08-08T15:30:00Z'
  },
  {
    id: '9',
    name: 'max-file-size-mb',
    value: '10',
    description: 'Maximum file size for uploads in MB',
    lastUpdated: '2025-08-07T12:15:00Z'
  },
  {
    id: '10',
    name: 'default-page-size',
    value: '20',
    description: 'Default number of items per page',
    lastUpdated: '2025-08-06T10:00:00Z'
  }
]