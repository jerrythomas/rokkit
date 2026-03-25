<script>
  import { getContext, onMount, onDestroy } from 'svelte'
  import { buildViolins } from '../lib/brewing/marks/violins.js'

  let { x, y, fill, color, stat = 'boxplot', options = {} } = $props()

  const plotState = getContext('plot-state')
  let id = $state(null)

  // fill ?? x drives the colors map; color is the optional stroke channel
  onMount(() => {
    id = plotState.registerGeom({ type: 'violin', channels: { x, y, color: fill ?? x }, stat, options })
  })
  onDestroy(() => { if (id) plotState.unregisterGeom(id) })

  $effect(() => {
    if (id) plotState.updateGeom(id, { channels: { x, y, color: fill ?? x }, stat })
  })

  const data   = $derived(id ? plotState.geomData(id) : [])
  const xScale = $derived(plotState.xScale)
  const yScale = $derived(plotState.yScale)
  const colors = $derived(plotState.colors)

  // fill ?? x drives violin interior; color drives outline stroke (optional)
  const violins = $derived.by(() => {
    if (!data?.length || !xScale || !yScale) return []
    return buildViolins(data, { x, fill: fill ?? x, color }, xScale, yScale, colors)
  })
</script>

{#if violins.length > 0}
  <g data-plot-geom="violin">
    {#each violins as v, i (`${String(v.cx)  }::${  i}`)}
      <path
        d={v.d}
        fill={v.fill}
        fill-opacity="0.7"
        stroke={v.stroke ?? 'none'}
        stroke-width="1"
        data-plot-element="violin"
      />
    {/each}
  </g>
{/if}
