<script>
  import { Select } from '@rokkit/ui'
  
  let options = ['Alpha', 'Beta', 'Gamma']
  let value = null
</script>

<Select {options} bind:value placeholder="Select a value" />