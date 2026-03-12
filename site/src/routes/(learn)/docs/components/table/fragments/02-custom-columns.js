// @ts-nocheck
const columns = [
  { name: 'name', label: 'Employee', width: '200px' },
  { name: 'department', label: 'Dept' },
  { name: 'salary', label: 'Salary', align: 'right', formatter: (v) => `$${Number(v).toLocaleString()}` }
]