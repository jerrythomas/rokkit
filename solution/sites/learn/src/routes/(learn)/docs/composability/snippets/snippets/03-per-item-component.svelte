const fields = { label: 'name', value: 'id', component: 'renderer' }
const items = [
  { name: 'Header', id: 1, renderer: HeaderComponent },
  { name: 'Divider', id: 2, renderer: DividerComponent }
]

<List items={items} {fields} />
