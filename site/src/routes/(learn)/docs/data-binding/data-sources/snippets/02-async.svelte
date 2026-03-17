<script>
  import { onMount } from 'svelte'
  import { List } from '@rokkit/ui'

  let items = $state([])

  onMount(async () => {
    const res = await fetch('/api/items')
    items = await res.json()
  })
</script>

<List {items} fields={{ text: 'name', value: 'id' }} />
