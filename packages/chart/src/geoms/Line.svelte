<script>
  import { getContext, onMount, onDestroy } from 'svelte'
  import { buildLines } from '../lib/brewing/marks/lines.js'

  let { x, y, color, stat = 'identity', options = {} } = $props()

  const state = getContext('plot-state')
  let id = $state(null)

  onMount(() => {
    id = state.registerGeom({ type: 'line', channels: { x, y, color }, stat, options })
  })
  onDestroy(() => { if (id) state.unregisterGeom(id) })

  const data   = $derived(id ? state.geomData(id) : [])
  const xScale = $derived(state.xScale)
  const yScale = $derived(state.yScale)
  const colors = $derived(state.colors)

  const lines = $derived.by(() => {
    if (!data?.length || !xScale || !yScale) return []
    return buildLines(data, { x, y, color }, xScale, yScale, colors, options.curve)
  })
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
    {/each}
  </g>
{/if}
