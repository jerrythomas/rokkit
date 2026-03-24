<script>
  import { getContext } from 'svelte'

  const modeRef = getContext('crossfilter-mode')
</script>

<span data-testid="mode-output" data-mode={modeRef?.mode}></span>
