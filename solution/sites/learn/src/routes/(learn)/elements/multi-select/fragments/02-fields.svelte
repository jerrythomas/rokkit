<script>
  import { MultiSelect } from '@rokkit/ui'
  
  const options = [
    { name: 'Fruits', category: 'food' },
    { name: 'Vegetables', category: 'food' }
  ]
  
  let fields = { text: 'name' }
  let value = []
</script>

<MultiSelect {options} {fields} bind:value />