<script>
  import { setContext } from 'svelte'
  import { ChartBrewer } from '../lib/brewing/brewer.svelte.js'
  import ChartPatternDefs from '../lib/ChartPatternDefs.svelte'

  /**
   * @type {{
   *   data?: Object[],
   *   label?: string,
   *   y?: string,
   *   color?: string,
   *   pattern?: string,
   *   width?: number,
   *   height?: number,
   *   mode?: 'light' | 'dark',
   *   legend?: boolean
   * }}
   */
  let {
    data = [],
    label = undefined,
    y = undefined,
    color = undefined,
    pattern = undefined,
    width = 400,
    height = 400,
    mode = 'light',
    legend = false
  } = $props()

  const brewer = new ChartBrewer()
  setContext('chart-brewer', brewer)

  $effect(() => {
    const channels = {}
    if (label)   channels.label = label
    if (y)       channels.y = y
    if (color)   channels.color = color
    if (pattern) channels.pattern = pattern
    brewer.update({ data, channels, width, height, mode })
  })

  // Derived chart data from brewer
  const arcs = $derived(brewer.arcs)
  const patternMap = $derived(brewer.patternMap)
  const colorMap = $derived(brewer.colorMap)

  // Legend items from brewer colorMap
  const legendItems = $derived(
    Array.from(colorMap.entries()).map(([key, entry]) => ({
      label: String(key),
      fill: entry.fill,
      patternId: patternMap.size > 0 && patternMap.has(key) ? `chart-pat-${key}` : null
    }))
  )
</script>

<div class="chart-container" data-chart-root data-chart-type="pie">
  <svg
    {width}
    {height}
    viewBox="0 0 {width} {height}"
    role="img"
    aria-label="Pie chart"
  >
    {#if patternMap.size > 0}
      <ChartPatternDefs {patternMap} {colorMap} />
    {/if}

    <!-- Arcs centered in the SVG -->
    {#if arcs && arcs.length > 0}
      <g
        class="chart-arcs"
        data-chart-mark="arc"
        transform="translate({width / 2}, {height / 2})"
      >
        {#each arcs as arc (arc.key)}
          {@const patternId = patternMap.size > 0 && patternMap.has(arc.key) ? `chart-pat-${arc.key}` : null}
          <path
            d={arc.d}
            fill={patternId ? `url(#${patternId})` : arc.fill}
            stroke={arc.stroke}
            stroke-width="1"
            data-chart-element="arc"
          />
        {/each}
      </g>
    {/if}

    <!-- Legend -->
    {#if legend && legendItems.length > 0}
      <g class="chart-legend" transform="translate(10, 10)" data-chart-legend>
        {#each legendItems as item, i}
          <g transform="translate(0, {i * 20})">
            {#if item.patternId}
              <svg x="0" y="0" width="10" height="10">
                <rect width="10" height="10" fill="url(#{item.patternId})" data-chart-legend-marker />
              </svg>
            {:else}
              <rect width="10" height="10" fill={item.fill} data-chart-legend-marker />
            {/if}
            <text x="14" y="9" text-anchor="start" data-chart-legend-label>{item.label}</text>
          </g>
        {/each}
      </g>
    {/if}
  </svg>
</div>

<style>
  .chart-container {
    position: relative;
    width: 100%;
    height: auto;
  }

  svg {
    display: block;
    overflow: visible;
  }

  .chart-legend {
    font-size: 11px;
    fill: currentColor;
  }
</style>
