<script>
  import { getContext, onMount, onDestroy } from 'svelte'
  import { buildAreas } from './lib/areas.js'

  let { x, y, color, stat = 'identity', options = {} } = $props()

  const state = getContext('plot-state')
  let id = $state(null)

  onMount(() => {
    id = state.registerGeom({ type: 'area', channels: { x, y, color }, stat, options })
  })
  onDestroy(() => { if (id) state.unregisterGeom(id) })

  const data   = $derived(id ? state.geomData(id) : [])
  const xScale = $derived(state.xScale)
  const yScale = $derived(state.yScale)
  const colors = $derived(state.colors)

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
