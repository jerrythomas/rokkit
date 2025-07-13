const columns = [
  { name: 'name', label: 'Person', sortable: true },
  { name: 'city', label: 'Residing in' },
  { 
    name: 'gender', 
    label: 'Gender', 
    formatter: (value) => (value === 'M' ? 'Male' : 'Female') 
  },
  {
    name: 'salary',
    label: 'Annual Salary',
    formatter: (value) => `$${value.toLocaleString()}`
  }
]