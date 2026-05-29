import { filterData } from '@rokkit/data'

const rows = [
  { status: 'active', name: 'Alice', score: 90 },
  { status: 'inactive', name: 'Bob', score: 70 }
]

// Declarative filter rules
const filtered = filterData(rows, [
  { column: 'status', operator: '=', value: 'active' },
  { column: 'score',  operator: '>', value: 80 }
])

// filtered → [{ status: 'active', name: 'Alice', score: 90 }]
