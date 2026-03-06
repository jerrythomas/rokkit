const fields = { text: 'label', value: 'id', children: 'items' }

const data = [
  { label: 'Fruits', id: 'fruits', items: [
    { label: 'Apple', id: 'apple' },
    { label: 'Banana', id: 'banana' }
  ]}
]

<List items={data} {fields} collapsible />
