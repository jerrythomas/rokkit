<script>
  import { getContext, onMount, onDestroy } from 'svelte'
  import { buildArcs } from '../lib/brewing/marks/arcs.js'

  /**
   * `fill` is the primary prop name; `color` is accepted as an alias for
   * spec-driven usage (Plot.svelte passes `color` to all geoms generically).
   * @type {{ theta?: string, fill?: string, color?: string, pattern?: string, stat?: string, labelFn?: (data: Record<string, unknown>) => string, options?: { innerRadius?: number } }}
   */
  let { theta, fill, color, pattern, labelFn = undefined, stat = 'identity', options = {} } = $props()

  const fillField = $derived(fill ?? color)

  const plotState = getContext('plot-state')
  let id = $state(null)

  onMount(() => {
    id = plotState.registerGeom({ type: 'arc', channels: { color: fillField, y: theta, pattern }, stat, options })
  })
  onDestroy(() => { if (id) plotState.unregisterGeom(id) })

  $effect(() => {
    if (id) plotState.updateGeom(id, { channels: { color: fillField, y: theta, pattern }, stat })
  })

  const data     = $derived(id ? plotState.geomData(id) : [])
  const colors   = $derived(plotState.colors)
  const patterns = $derived(plotState.patterns)
  const w        = $derived(plotState.innerWidth)
  const h        = $derived(plotState.innerHeight)

  const arcs = $derived.by(() => {
    if (!data?.length) return []
    // Guard: skip until data catches up after a fill-field change.
    // When fillField changes, the $effect updates the geom asynchronously, but
    // this derived runs first with stale data whose rows don't have the new
    // field — causing all keys to be undefined (duplicate key error).
    if (fillField && !(fillField in data[0])) return []
    const innerRadius = (options.innerRadius ?? 0) * Math.min(w, h) / 2
    return buildArcs(data, { color: fillField, y: theta, pattern }, colors, w, h, { innerRadius }, patterns)
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
        onmouseenter={() => plotState.setHovered({ ...arc.data, '%': `${arc.pct}%` })}
        onmouseleave={() => plotState.clearHovered()}
      />
      {#if arc.patternId}
        <path d={arc.d} fill="url(#{arc.patternId})" stroke={arc.stroke} stroke-width="1" pointer-events="none" data-plot-element="arc" />
      {/if}
      {#if arc.pct >= 5}
        {@const labelText = labelFn ? String(labelFn(arc.data) ?? '') : `${arc.pct}%`}
        {#if labelText}
          {@const lw = Math.max(36, labelText.length * 7 + 12)}
          <g transform="translate({arc.centroid[0]},{arc.centroid[1]})" pointer-events="none" data-plot-element="arc-label">
            <rect x={-lw / 2} y="-9" width={lw} height="18" rx="4" fill="white" fill-opacity="0.82" />
            <text
              text-anchor="middle"
              dominant-baseline="central"
              font-size="11"
              font-weight="600"
              fill={arc.stroke}
            >{labelText}</text>
          </g>
        {/if}
      {/if}
    {/each}
  </g>
{/if}
