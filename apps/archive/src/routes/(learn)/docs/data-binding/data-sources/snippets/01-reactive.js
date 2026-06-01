let items = $state([
  { id: 1, label: 'Alpha' },
])

function addItem() {
  items.push({ id: Date.now(), label: 'New' })
}
