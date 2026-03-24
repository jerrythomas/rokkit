<script>
  import { getContext, onMount, onDestroy } from 'svelte'
  import { buildPoints } from '../lib/brewing/marks/points.js'

  let { x, y, color, size, stat = 'identity', options = {} } = $props()

  const state = getContext('plot-state')
  let id = $state(null)

  onMount(() => {
    id = state.registerGeom({ type: 'point', channels: { x, y, color, size }, stat, options })
  })
  onDestroy(() => { if (id) state.unregisterGeom(id) })

  const data    = $derived(id ? state.geomData(id) : [])
  const xScale  = $derived(state.xScale)
  const yScale  = $derived(state.yScale)
  const colors  = $derived(state.colors)
  // Size scale: future enhancement — null for now
  const sizeScale = null

  const points = $derived.by(() => {
    if (!data?.length || !xScale || !yScale) return []
    return buildPoints(data, { x, y, color, size }, xScale, yScale, colors, sizeScale, null, options.radius ?? 4)
  })
</script>

{#if points.length > 0}
  <g data-plot-geom="point">
    {#each points as pt, i (`${pt.data[x]}-${pt.data[y]}-${pt.data[color ?? ''] ?? i}`)}
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
