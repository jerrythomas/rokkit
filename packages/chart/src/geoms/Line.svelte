<script>
  import { getContext, onMount, onDestroy } from 'svelte'
  import { buildLines } from '../lib/brewing/marks/lines.js'
  import { buildSymbolPath } from '../lib/brewing/marks/points.js'

  let { x, y, color, symbol: symbolField, stat = 'identity', options = {} } = $props()

  const plotState = getContext('plot-state')
  let id = $state(null)

  onMount(() => {
    id = plotState.registerGeom({ type: 'line', channels: { x, y, color, symbol: symbolField }, stat, options })
  })
  onDestroy(() => { if (id) plotState.unregisterGeom(id) })

  $effect(() => {
    if (id) plotState.updateGeom(id, { channels: { x, y, color, symbol: symbolField }, stat })
  })

  const data      = $derived(id ? plotState.geomData(id) : [])
  const xScale    = $derived(plotState.xScale)
  const yScale    = $derived(plotState.yScale)
  const colors    = $derived(plotState.colors)
  const symbolMap = $derived(plotState.symbols)

  const lines = $derived.by(() => {
    if (!data?.length || !xScale || !yScale) return []
    return buildLines(data, { x, y, color }, xScale, yScale, colors, options.curve)
  })

  const markerRadius = $derived(options.markerRadius ?? 4)
</script>

{#if lines.length > 0}
  <g data-plot-geom="line">
    {#each lines as seg (seg.key ?? seg.d)}
      <path
        d={seg.d}
        fill="none"
        stroke={seg.stroke}
        stroke-width={options.strokeWidth ?? 2}
        stroke-linejoin="round"
        stroke-linecap="round"
        data-plot-element="line"
      />
      {#if symbolField && symbolMap}
        {#each seg.points as pt (`${pt.x}::${pt.y}`)}
          <path
            transform="translate({pt.x},{pt.y})"
            d={buildSymbolPath(symbolMap.get(pt.data[symbolField]) ?? 'circle', markerRadius)}
            fill={seg.stroke}
            stroke={seg.stroke}
            stroke-width="1"
            data-plot-element="line-marker"
          />
        {/each}
      {/if}
    {/each}
  </g>
{/if}
