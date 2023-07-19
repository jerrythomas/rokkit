<script>
import { Form } from '@rokkit/organisms'

import { items } from './categories'
const schema = {
  type: 'object',
  properties: {
    name: { type: 'string', required: true },
    category: { type: 'enum', required: true }
  }
}
const layout = {
  elements: [
    {
      label: 'Item Name',
      scope: '#/name'
    },
    {
      label: 'category',
      scope: '#/category',
      editor: 'select',
      items
    }
  ]
}

let value = {}
</script>

<Form {schema} {layout} bind:value />
<pre>{JSON.stringify(value, null,2)}</pre>