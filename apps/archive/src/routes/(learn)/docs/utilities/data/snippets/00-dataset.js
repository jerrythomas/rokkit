import { dataset } from '@rokkit/data'

const salesData = [
  { region: 'West', amount: 1200, active: true },
  { region: 'East', amount: 800,  active: false },
  { region: 'West', amount: 950,  active: true }
]

// Fluent pipeline: filter → sort → select
const result = dataset(salesData)
  .where(row => row.active)
  .sortBy('amount')
  .select()

// result → [{ region: 'West', amount: 950 }, { region: 'West', amount: 1200 }]
