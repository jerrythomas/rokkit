<script>
  import { MultiSelect } from '@rokkit/ui'
  
  let options = ['Alpha', 'Beta', 'Gamma']
  let value = []
</script>

<MultiSelect {options} bind:value placeholder="Select multiple values" />