<script>
  import { getContext, onMount, onDestroy } from 'svelte'
  import { buildGroupedBars, buildStackedBars, buildHorizontalBars } from './lib/bars.js'

  let { x, y, color, stat = 'identity', options = {} } = $props()

  const plotState = getContext('plot-state')
  let id = $state(null)

  onMount(() => {
    id = plotState.registerGeom({ type: 'bar', channels: { x, y, color }, stat, options })
  })
  onDestroy(() => {
    if (id) plotState.unregisterGeom(id)
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
    const channels = { x, y, color }
    if (orientation === 'horizontal') {
      return buildHorizontalBars(data, channels, xScale, yScale, colors, innerHeight)
    }
    if (options.stack) {
      return buildStackedBars(data, channels, xScale, yScale, colors, innerHeight)
    }
    return buildGroupedBars(data, channels, xScale, yScale, colors, innerHeight, patterns)
  })
</script>

{#if bars.length > 0}
  <g data-plot-geom="bar">
    {#each bars as bar (bar.key)}
      <rect
        x={bar.x}
        y={bar.y}
        width={Math.max(0, bar.width)}
        height={Math.max(0, bar.height)}
        fill={bar.patternId ? `url(#${bar.patternId})` : bar.fill}
        stroke={bar.stroke ?? 'none'}
        stroke-width={bar.stroke ? 0.5 : 0}
        data-plot-element="bar"
        data-plot-value={bar.data[y]}
        data-plot-category={bar.data[x]}
        role="graphics-symbol"
        aria-label="{bar.data[x]}: {bar.data[y]}"
      >
        <title>{bar.data[x]}: {bar.data[y]}</title>
      </rect>
    {/each}
  </g>
{/if}
