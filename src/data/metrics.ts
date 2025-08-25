export type Metric = {
  id: string
  label: string
  value: string
  changePct?: number
  trend?: 'up' | 'down'
  helperText?: string
}

export const metrics: Metric[] = [
  {
    id: 'm1',
    label: 'Total Companies',
    value: '20',
    changePct: 5.2,
    trend: 'up',
    helperText: 'vs last 30 days'
  },
  {
    id: 'm2',
    label: 'Net Sales Balance',
    value: '£2.68m',
    changePct: 1.1,
    trend: 'up',
    helperText: 'MTD'
  },
  {
    id: 'm3',
    label: 'Net Purchase Balance',
    value: '£1.47m',
    changePct: -0.6,
    trend: 'down',
    helperText: 'MTD'
  },
  {
    id: 'm4',
    label: 'Cloud Connections',
    value: '12',
    changePct: 2.0,
    trend: 'up',
    helperText: 'of 20 total'
  },
]
