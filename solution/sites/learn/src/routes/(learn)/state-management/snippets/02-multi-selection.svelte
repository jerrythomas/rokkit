<script>
  import { MultiSelect } from '@rokkit/ui'

  let selected = $state([])
</script>

<MultiSelect items={options} {fields} bind:value={selected} />
<p>Selected: {selected.join(', ')}</p>
