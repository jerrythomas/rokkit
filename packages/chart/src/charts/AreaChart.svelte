<script>
  import { setContext } from 'svelte'
  import { CartesianBrewer } from '../lib/brewing/CartesianBrewer.svelte.js'
  import ChartPatternDefs from '../lib/ChartPatternDefs.svelte'

  /**
   * @type {{
   *   data?: Object[],
   *   x?: string,
   *   y?: string,
   *   fill?: string,
   *   pattern?: string,
   *   width?: number,
   *   height?: number,
   *   mode?: 'light' | 'dark',
   *   grid?: boolean,
   *   legend?: boolean,
   *   curve?: 'linear' | 'smooth' | 'step',
   *   stat?: string
   * }}
   */
  let {
    data = [],
    x = undefined,
    y = undefined,
    fill = undefined,
    pattern = undefined,
    width = 600,
    height = 400,
    mode = 'light',
    grid = true,
    legend = false,
    curve = 'linear',
    stat = 'identity'
  } = $props()

  const brewer = new CartesianBrewer()
  setContext('chart-brewer', brewer)

  $effect(() => {
    const channels = {}
    if (x)    channels.x = x
    if (y)    channels.y = y
    if (fill) channels.fill = fill
    if (pattern) channels.pattern = pattern
    brewer.update({ data, channels, width, height, mode, curve, stat })
  })

  const margin = { top: 20, right: 20, bottom: 40, left: 50 }
  const innerWidth = $derived(width - margin.left - margin.right)
  const innerHeight = $derived(height - margin.top - margin.bottom)

  const areas = $derived(brewer.areas)
  const xScale = $derived(brewer.xScale)
  const yScale = $derived(brewer.yScale)
  const patternDefs = $derived(brewer.patternDefs)

  const xTicks = $derived(
    xScale && typeof xScale.domain === 'function'
      ? xScale.domain().map((val) => ({
          value: val,
          x: (xScale(val) ?? 0) + (typeof xScale.bandwidth === 'function' ? xScale.bandwidth() / 2 : 0)
        }))
      : []
  )

  const yTicks = $derived(
    yScale && typeof yScale.ticks === 'function'
      ? yScale.ticks(5).map((val) => ({ value: val, y: yScale(val) }))
      : []
  )

  const gridLines = $derived(
    yScale && typeof yScale.ticks === 'function'
      ? yScale.ticks(5).map((val) => ({ y: yScale(val) }))
      : []
  )

  const legendGroups = $derived(brewer.legendGroups)
</script>

<div class="chart-container" data-chart-root data-chart-type="area">
  <svg
    {width}
    {height}
    viewBox="0 0 {width} {height}"
    role="img"
    aria-label="Area chart"
  >
    {#if patternDefs.length > 0}
      <ChartPatternDefs defs={patternDefs} />
    {/if}

    <g
      class="chart-area"
      transform="translate({margin.left}, {margin.top})"
      data-chart-canvas
    >
      <!-- Grid lines -->
      {#if grid}
        <g class="chart-grid" data-chart-grid>
          {#each gridLines as line}
            <line
              x1="0"
              y1={line.y}
              x2={innerWidth}
              y2={line.y}
              data-chart-grid-line
            />
          {/each}
        </g>
      {/if}

      <!-- Areas -->
      <g class="chart-areas" data-chart-mark="area">
        {#each areas as seg (seg.key ?? seg.d)}
          <path
            d={seg.d}
            fill={seg.patternId ? `url(#${seg.patternId})` : seg.fill}
            stroke={seg.stroke}
            opacity="0.7"
            data-chart-element="area"
          />
        {/each}
      </g>

      <!-- X axis -->
      {#if xScale}
        <g class="axis x-axis" transform="translate(0, {innerHeight})" data-chart-axis="x">
          <line x1="0" y1="0" x2={innerWidth} y2="0" data-chart-axis-line />
          {#each xTicks as tick}
            <g class="chart-tick" transform="translate({tick.x}, 0)" data-chart-tick>
              <line x1="0" y1="0" x2="0" y2="6" />
              <text x="0" y="9" text-anchor="middle" dominant-baseline="hanging" data-chart-tick-label>
                {tick.value}
              </text>
            </g>
          {/each}
        </g>
      {/if}

      <!-- Y axis -->
      {#if yScale}
        <g class="axis y-axis" data-chart-axis="y">
          <line x1="0" y1="0" x2="0" y2={innerHeight} data-chart-axis-line />
          {#each yTicks as tick}
            <g class="chart-tick" transform="translate(0, {tick.y})" data-chart-tick>
              <line x1="-6" y1="0" x2="0" y2="0" />
              <text x="-9" y="0" text-anchor="end" dominant-baseline="middle" data-chart-tick-label>
                {tick.value}
              </text>
            </g>
          {/each}
        </g>
      {/if}
    </g>
  </svg>

  <!-- HTML legend -->
  {#if legend && legendGroups.length > 0}
    <div data-chart-legend>
      {#each legendGroups as group}
        {#if legendGroups.length > 1}
          <div data-chart-legend-title>{group.field}</div>
        {/if}
        {#each group.items as item (item.label)}
          <div data-chart-legend-item>
            {#if item.patternId}
              <svg width="12" height="12" data-chart-legend-swatch>
                <rect width="12" height="12" fill={item.fill ?? '#ddd'} />
                <rect width="12" height="12" fill="url(#{item.patternId})" />
              </svg>
            {:else}
              <span data-chart-legend-swatch style="background-color: {item.fill ?? '#ddd'}"></span>
            {/if}
            <span data-chart-legend-label>{item.label}</span>
          </div>
        {/each}
      {/each}
    </div>
  {/if}
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

  .chart-area {
    pointer-events: all;
  }

  .axis {
    font-size: 11px;
    fill: currentColor;
  }

  .chart-grid {
    pointer-events: none;
  }
</style>
