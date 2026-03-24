<script>
  import { getContext, onMount, onDestroy } from 'svelte'
  import { buildArcs } from '../lib/brewing/marks/arcs.js'

  /** @type {{ theta?: string, color?: string, stat?: string, options?: { innerRadius?: number } }} */
  let { theta, color, stat = 'identity', options = {} } = $props()

  const plotState = getContext('plot-state')
  let id = $state(null)

  onMount(() => {
    id = plotState.registerGeom({ type: 'arc', channels: { label: color, y: theta }, stat, options })
  })
  onDestroy(() => { if (id) plotState.unregisterGeom(id) })

  const data   = $derived(id ? plotState.geomData(id) : [])
  const colors = $derived(plotState.colors)
  const w      = $derived(plotState.innerWidth)
  const h      = $derived(plotState.innerHeight)

  const arcs = $derived.by(() => {
    if (!data?.length) return []
    const innerRadius = (options.innerRadius ?? 0) * Math.min(w, h) / 2
    return buildArcs(data, { label: color, y: theta }, colors, w, h, { innerRadius })
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
    {/each}
  </g>
{/if}
