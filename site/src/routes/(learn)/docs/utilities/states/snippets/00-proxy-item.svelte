<script>
  import { ProxyItem } from '@rokkit/states'

  const fields = { label: 'name', value: 'id' }
  const item = { id: 1, name: 'Alice', role: 'admin' }
  const proxy = new ProxyItem(item, fields)

  // proxy.label → 'Alice'  (resolved from fields.label = 'name')
  // proxy.value → 1        (resolved from fields.value = 'id')
  // proxy.raw   → original item object
</script>
