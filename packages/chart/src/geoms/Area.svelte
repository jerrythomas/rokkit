<script>
  import { getContext, onMount, onDestroy } from 'svelte'
  import { buildAreas } from './lib/areas.js'

  let { x, y, color, stat = 'identity', options = {} } = $props()

  const plotState = getContext('plot-state')
  let id = $state(null)

  onMount(() => {
    id = plotState.registerGeom({ type: 'area', channels: { x, y, color }, stat, options })
  })
  onDestroy(() => { if (id) plotState.unregisterGeom(id) })

  $effect(() => {
    if (id) plotState.updateGeom(id, { channels: { x, y, color }, stat })
  })

  const data   = $derived(id ? plotState.geomData(id) : [])
  const xScale = $derived(plotState.xScale)
  const yScale = $derived(plotState.yScale)
  const colors = $derived(plotState.colors)

  const areas = $derived.by(() => {
    if (!data?.length || !xScale || !yScale) return []
    return buildAreas(data, { x, y, color }, xScale, yScale, colors, options.curve)
  })
</script>

{#if areas.length > 0}
  <g data-plot-geom="area">
    {#each areas as seg (seg.key ?? seg.d)}
      <path
        d={seg.d}
        fill={seg.fill}
        fill-opacity={options.opacity ?? 0.3}
        stroke={seg.stroke ?? 'none'}
        data-plot-element="area"
      />
    {/each}
  </g>
{/if}
