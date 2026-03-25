<script>
  import { getContext, onMount, onDestroy } from 'svelte'
  import { buildAreas, buildStackedAreas } from './lib/areas.js'

  let { x, y, color, pattern, stat = 'identity', options = {} } = $props()

  const plotState = getContext('plot-state')
  let id = $state(null)

  onMount(() => {
    id = plotState.registerGeom({ type: 'area', channels: { x, y, color, pattern }, stat, options: { stack: options?.stack ?? false } })
  })
  onDestroy(() => { if (id) plotState.unregisterGeom(id) })

  $effect(() => {
    if (id) plotState.updateGeom(id, { channels: { x, y, color, pattern }, stat, options: { stack: options?.stack ?? false } })
  })

  const data     = $derived(id ? plotState.geomData(id) : [])
  const xScale   = $derived(plotState.xScale)
  const yScale   = $derived(plotState.yScale)
  const colors   = $derived(plotState.colors)
  const patterns = $derived(plotState.patterns)

  const areas = $derived.by(() => {
    if (!data?.length || !xScale || !yScale) return []
    if (options.stack) {
      return buildStackedAreas(data, { x, y, color }, xScale, yScale, colors, options.curve, patterns)
    }
    return buildAreas(data, { x, y, color }, xScale, yScale, colors, options.curve, patterns)
  })
</script>

{#if areas.length > 0}
  <g data-plot-geom="area">
    {#each areas as seg (seg.key ?? seg.d)}
      <path
        d={seg.d}
        fill={seg.patternId ? `url(#${seg.patternId})` : seg.fill}
        fill-opacity={options.opacity ?? 0.3}
        stroke={seg.stroke ?? 'none'}
        data-plot-element="area"
      />
    {/each}
  </g>
{/if}
