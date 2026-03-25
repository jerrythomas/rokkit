<script>
  import { getContext, onMount, onDestroy } from 'svelte'
  import { scaleSqrt } from 'd3-scale'
  import { buildPoints } from '../lib/brewing/marks/points.js'

  let { x, y, color, size, stat = 'identity', options = {} } = $props()

  const plotState = getContext('plot-state')
  let id = $state(null)

  onMount(() => {
    id = plotState.registerGeom({ type: 'point', channels: { x, y, color, size }, stat, options })
  })
  onDestroy(() => { if (id) plotState.unregisterGeom(id) })

  $effect(() => {
    if (id) plotState.updateGeom(id, { channels: { x, y, color, size }, stat })
  })

  const data    = $derived(id ? plotState.geomData(id) : [])
  const xScale  = $derived(plotState.xScale)
  const yScale  = $derived(plotState.yScale)
  const colors  = $derived(plotState.colors)

  const sizeScale = $derived.by(() => {
    if (!size || !data?.length) return null
    const vals = data.map((d) => Number(d[size])).filter((v) => !isNaN(v))
    if (!vals.length) return null
    const maxVal = Math.max(...vals)
    const minVal = Math.min(...vals)
    return scaleSqrt().domain([minVal, maxVal]).range([options.minRadius ?? 3, options.maxRadius ?? 20])
  })

  const points = $derived.by(() => {
    if (!data?.length || !xScale || !yScale) return []
    return buildPoints(data, { x, y, color, size }, xScale, yScale, colors, sizeScale, null, options.radius ?? 4)
  })
</script>

{#if points.length > 0}
  <g data-plot-geom="point">
    {#each points as pt, i (`${i}::${pt.data[x]}::${pt.data[y]}`)}
      <circle
        cx={pt.cx}
        cy={pt.cy}
        r={pt.r}
        fill={pt.fill}
        stroke={pt.stroke}
        stroke-width="1"
        fill-opacity={options.opacity ?? 0.8}
        data-plot-element="point"
        role="graphics-symbol"
        aria-label="{pt.data[x]}, {pt.data[y]}"
      />
    {/each}
  </g>
{/if}
