<script>
  import { Toggle } from '@rokkit/ui'

  let options = ['Daily', 'Weekly', 'Monthly']
  let value = $state('Weekly')
</script>

<Toggle {options} bind:value />
