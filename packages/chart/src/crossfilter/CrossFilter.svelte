<script>
  import { setContext } from 'svelte'
  import { createCrossFilter } from './createCrossFilter.svelte.js'

  /**
   * @type {{
   *   crossfilter?: ReturnType<typeof createCrossFilter>,
   *   mode?: 'dim' | 'hide',
   *   filters?: import('./createCrossFilter.svelte.js').FilterState,
   *   children?: import('svelte').Snippet
   * }}
   */
  let {
    crossfilter: externalCf = undefined,
    mode = 'dim',
    filters = $bindable(undefined),
    children
  } = $props()

  // Use an externally provided instance (spec/helpers API) or create one internally
  const cf = externalCf ?? createCrossFilter()

  // Expose the reactive filters Map to callers via bind:filters
  $effect(() => {
    filters = cf.filters
  })

  setContext('crossfilter', cf)
  setContext('crossfilter-mode', mode)
</script>

<div data-crossfilter data-crossfilter-mode={mode}>
  {@render children?.()}
</div>
