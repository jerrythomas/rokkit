<script>
  import { List, Select, Table } from '@rokkit/ui'

  const users = await fetch('/api/users').then(r => r.json())
  const fields = { label: 'name', value: 'id' }
</script>

<List items={users} {fields} bind:value />
<Select items={users} {fields} bind:value />
<Table items={users} {fields} />
