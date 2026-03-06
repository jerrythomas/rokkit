const users = [
  { name: 'Alice', id: 1 },
  { name: 'Bob', id: 2 }
]

// Map your fields to component roles
const fields = { text: 'name', value: 'id' }

<List items={users} {fields} />
<Select items={users} {fields} />
<Table items={users} {fields} />
