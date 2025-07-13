<script>
  import { Range } from '@rokkit/ui'
  
  let value = 50
</script>

<Range bind:value min={0} max={100} steps={5} class="w-full" />