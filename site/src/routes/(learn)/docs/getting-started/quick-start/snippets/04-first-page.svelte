<script>
  import { List, Select } from '@rokkit/ui'

  const people = [
    { id: 1, name: 'Ada Lovelace', role: 'Engineer' },
    { id: 2, name: 'Grace Hopper', role: 'Admiral'  },
    { id: 3, name: 'Alan Turing',  role: 'Theorist' },
  ]

  const fields = { text: 'name', value: 'id', description: 'role' }
  let selected = $state(null)
</script>

<List items={people} {fields} bind:value={selected} />
<p>Selected: {selected}</p>

<!-- Same data, different component -->
<Select items={people} {fields} bind:value={selected} />
