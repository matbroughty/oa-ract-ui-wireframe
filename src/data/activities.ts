export type Activity = {
  id: string
  company: string
  action: string
  time: string // ISO
  meta?: string
}

export const activities: Activity[] = [
  { id: 'a1', company: "Seaside Bakery", action: 'Loaded new transactions', time: '2025-08-25T15:45:00Z', meta: '143 records' },
  { id: 'a2', company: "Oxford Analytics", action: 'Synced to cloud', time: '2025-08-25T14:20:00Z' },
  { id: 'a3', company: "Aurora Media", action: 'User invited', time: '2025-08-25T12:02:00Z', meta: 'Finance@aurora.com' },
  { id: 'a4', company: "Green Leaf Foods", action: 'Clear action executed', time: '2025-08-24T17:30:00Z' },
  { id: 'a5', company: "Jimbo\'s Cars", action: 'Edited company details', time: '2025-08-24T09:12:00Z' },
]
