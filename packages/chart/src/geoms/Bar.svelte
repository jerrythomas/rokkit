<script>
  import { getContext, onMount, onDestroy } from 'svelte'
  import { buildGroupedBars, buildStackedBars, buildHorizontalBars } from './lib/bars.js'
  import LabelPill from './LabelPill.svelte'

  let { x, y, color, fill: fillProp, pattern, label = false, stat = 'identity', options = {}, filterable = false } = $props()

  // `fill` is accepted as an alias for `color` (consistent with Arc.svelte)
  const colorChannel = $derived(fillProp ?? color)

  /**
   * @param {Record<string, unknown>} data
   * @param {string} defaultField
   * @returns {string | null}
   */
  function resolveLabel(data, defaultField) {
    if (!label) return null
    if (label === true) return String(data[defaultField] ?? '')
    if (typeof label === 'function') return String(label(data) ?? '')
    if (typeof label === 'string') return String(data[label] ?? '')
    return null
  }

  const plotState = getContext('plot-state')
  const cf = getContext('crossfilter')
  let id = $state(null)

  onMount(() => {
    id = plotState.registerGeom({ type: 'bar', channels: { x, y, color: colorChannel, pattern }, stat, options: { stack: options?.stack ?? false } })
  })
  onDestroy(() => {
    if (id) plotState.unregisterGeom(id)
  })

  $effect(() => {
    if (id) plotState.updateGeom(id, { channels: { x, y, color: colorChannel, pattern }, stat, options: { stack: options?.stack ?? false } })
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
    const channels = { x, y, color: colorChannel, pattern }
    if (orientation === 'horizontal') {
      return buildHorizontalBars(data, channels, xScale, yScale, colors, innerHeight)
    }
    if (options.stack) {
      return buildStackedBars(data, channels, xScale, yScale, colors, innerHeight, patterns)
    }
    return buildGroupedBars(data, channels, xScale, yScale, colors, innerHeight, patterns)
  })

  /** @type {Record<string, boolean>} */
  let dimmedByKey = $state({})

  $effect(() => {
    if (!cf) { dimmedByKey = {}; return }
    // cf.version is a $state counter that increments on every filter mutation.
    // Reading it here establishes a reactive dependency so the effect re-runs
    // whenever any filter changes — including changes from sibling FilterBars.
    void cf.version
    const next = /** @type {Record<string, boolean>} */ ({})
    for (const bar of bars) {
      const dimmedByX = x ? cf.isDimmed(x, bar.data[x]) : false
      const dimmedByY = y ? cf.isDimmed(y, bar.data[y]) : false
      next[bar.key] = dimmedByX || dimmedByY
    }
    dimmedByKey = next
  })

  function handleBarClick(barX) {
    if (!filterable || !x || !cf) return
    cf.toggleCategorical(x, barX)
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
        onmouseenter={() => plotState.setHovered(bar.data)}
        onmouseleave={() => plotState.clearHovered()}
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
      {#if label}
        {@const text = resolveLabel(bar.data, orientation === 'horizontal' ? x : y)}
        {#if text}
          {#if orientation === 'horizontal'}
            <LabelPill
              x={bar.x + bar.width + (options.labelOffset ?? 8)}
              y={bar.y + bar.height / 2}
              {text}
              color={bar.stroke ?? '#333'}
            />
          {:else}
            <LabelPill
              x={bar.x + bar.width / 2}
              y={bar.y + (options.labelOffset ?? -8)}
              {text}
              color={bar.stroke ?? '#333'}
            />
          {/if}
        {/if}
      {/if}
    {/each}
  </g>
{/if}
