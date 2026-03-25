<script>
  import { getContext, onMount, onDestroy } from 'svelte'
  import { buildGroupedBars, buildStackedBars, buildHorizontalBars } from './lib/bars.js'

  let { x, y, color, pattern, stat = 'identity', options = {}, filterable = false } = $props()

  const plotState = getContext('plot-state')
  const cf = getContext('crossfilter')
  let id = $state(null)

  onMount(() => {
    id = plotState.registerGeom({ type: 'bar', channels: { x, y, color, pattern }, stat, options: { stack: options?.stack ?? false } })
  })
  onDestroy(() => {
    if (id) plotState.unregisterGeom(id)
  })

  $effect(() => {
    if (id) plotState.updateGeom(id, { channels: { x, y, color, pattern }, stat, options: { stack: options?.stack ?? false } })
  })

  const data        = $derived(id ? plotState.geomData(id) : [])
  const xScale      = $derived(plotState.xScale)
  const yScale      = $derived(plotState.yScale)
  const colors      = $derived(plotState.colors)
  const patterns    = $derived(plotState.patterns)
  const orientation = $derived(plotState.orientation)
  const innerHeight = $derived(plotState.innerHeight)

  const bars = $derived.by(() => {
    if (!data?.length || !xScale || !yScale) return []
    const channels = { x, y, color, pattern }
    if (orientation === 'horizontal') {
      return buildHorizontalBars(data, channels, xScale, yScale, colors, innerHeight)
    }
    if (options.stack) {
      return buildStackedBars(data, channels, xScale, yScale, colors, innerHeight, patterns)
    }
    return buildGroupedBars(data, channels, xScale, yScale, colors, innerHeight, patterns)
  })

  // Separate $state record as template source of truth for dimmed keys.
  // Cross-component $state (from CrossFilter context) cannot be reliably tracked
  // by $effect in this component — so we sync manually on each filter mutation.
  /** @type {Record<string, boolean>} */
  let dimmedByKey = $state({})

  /**
   * Recomputes dimmedByKey using the current crossfilter state.
   * Called after each filter mutation so the local $state updates.
   */
  function syncDimming() {
    if (!cf) { dimmedByKey = {}; return }
    const next = /** @type {Record<string, boolean>} */ ({})
    for (const bar of bars) {
      next[bar.key] = x ? cf.isDimmed(x, bar.data[x]) : false
    }
    dimmedByKey = next
  }

  onMount(syncDimming)

  function handleBarClick(barX) {
    if (!filterable || !x || !cf) return
    cf.toggleCategorical(x, barX)
    syncDimming()
  }
</script>

{#if bars.length > 0}
  <g data-plot-geom="bar">
    {#each bars as bar (bar.key)}
      <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
      <rect
        x={bar.x}
        y={bar.y}
        width={Math.max(0, bar.width)}
        height={Math.max(0, bar.height)}
        fill={bar.fill}
        stroke={bar.stroke ?? 'none'}
        stroke-width={bar.stroke ? 0.5 : 0}
        data-plot-element="bar"
        data-plot-value={bar.data[y]}
        data-plot-category={bar.data[x]}
        data-dimmed={dimmedByKey[bar.key] ? true : undefined}
        style:cursor={filterable ? 'pointer' : undefined}
        onclick={filterable && x ? () => handleBarClick(bar.data[x]) : undefined}
        onkeydown={filterable && x ? (e) => (e.key === 'Enter' || e.key === ' ') && handleBarClick(bar.data[x]) : undefined}
        role={filterable ? 'button' : 'graphics-symbol'}
        tabindex={filterable ? 0 : undefined}
        aria-label="{bar.data[x]}: {bar.data[y]}"
      >
        <title>{bar.data[x]}: {bar.data[y]}</title>
      </rect>
      {#if bar.patternId}
        <rect
          x={bar.x}
          y={bar.y}
          width={Math.max(0, bar.width)}
          height={Math.max(0, bar.height)}
          fill="url(#{bar.patternId})"
          pointer-events="none"
        />
      {/if}
    {/each}
  </g>
{/if}
