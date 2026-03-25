<script>
  import { getContext, onMount, onDestroy } from 'svelte'
  import { buildArcs } from '../lib/brewing/marks/arcs.js'

  /** @type {{ theta?: string, color?: string, pattern?: string, stat?: string, options?: { innerRadius?: number } }} */
  let { theta, color, pattern, stat = 'identity', options = {} } = $props()

  const plotState = getContext('plot-state')
  let id = $state(null)

  onMount(() => {
    id = plotState.registerGeom({ type: 'arc', channels: { color, y: theta, pattern }, stat, options })
  })
  onDestroy(() => { if (id) plotState.unregisterGeom(id) })

  $effect(() => {
    if (id) plotState.updateGeom(id, { channels: { color, y: theta, pattern }, stat })
  })

  const data     = $derived(id ? plotState.geomData(id) : [])
  const colors   = $derived(plotState.colors)
  const patterns = $derived(plotState.patterns)
  const w        = $derived(plotState.innerWidth)
  const h        = $derived(plotState.innerHeight)

  const arcs = $derived.by(() => {
    if (!data?.length) return []
    const innerRadius = (options.innerRadius ?? 0) * Math.min(w, h) / 2
    return buildArcs(data, { color, y: theta, pattern }, colors, w, h, { innerRadius }, patterns)
  })
</script>

{#if arcs.length > 0}
  <g
    data-plot-geom="arc"
    transform="translate({w / 2}, {h / 2})"
  >
    {#each arcs as arc (arc.key)}
      <path
        d={arc.d}
        fill={arc.fill}
        stroke={arc.stroke}
        stroke-width="1"
        data-plot-element="arc"
      />
      {#if arc.patternId}
        <path d={arc.d} fill="url(#{arc.patternId})" stroke={arc.stroke} stroke-width="1" pointer-events="none" data-plot-element="arc" />
      {/if}
      {#if arc.pct >= 5}
        <g transform="translate({arc.centroid[0]},{arc.centroid[1]})" pointer-events="none" data-plot-element="arc-label">
          <rect x="-18" y="-9" width="36" height="18" rx="4" fill="white" fill-opacity="0.82" />
          <text
            text-anchor="middle"
            dominant-baseline="central"
            font-size="11"
            font-weight="600"
            fill={arc.stroke}
          >{arc.pct}%</text>
        </g>
      {/if}
    {/each}
  </g>
{/if}
