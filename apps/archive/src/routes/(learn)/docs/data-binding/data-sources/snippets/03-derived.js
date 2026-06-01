let query = $state('')
let all = $state([...])

let filtered = $derived(
  all.filter(item => item.name.toLowerCase().includes(query.toLowerCase()))
)
