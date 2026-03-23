<script>
  import { setContext } from 'svelte'
  import { ChartBrewer } from '../lib/brewing/brewer.svelte.js'
  import Shape from '../symbols/Shape.svelte'

  /**
   * @type {{
   *   data?: Object[],
   *   x?: string,
   *   y?: string,
   *   color?: string,
   *   width?: number,
   *   height?: number,
   *   mode?: 'light' | 'dark',
   *   grid?: boolean,
   *   legend?: boolean,
   *   curve?: 'linear' | 'smooth' | 'step',
   *   symbol?: string
   * }}
   */
  let {
    data = [],
    x = undefined,
    y = undefined,
    color = undefined,
    width = 600,
    height = 400,
    mode = 'light',
    grid = true,
    legend = false,
    curve = 'linear',
    symbol = undefined
  } = $props()

  const brewer = new ChartBrewer()
  setContext('chart-brewer', brewer)

  $effect(() => {
    const channels = {}
    if (x)      channels.x = x
    if (y)      channels.y = y
    if (color)  channels.color = color
    if (symbol) channels.symbol = symbol
    brewer.update({ data, channels, width, height, mode, curve })
  })

  const margin = { top: 20, right: 20, bottom: 40, left: 50 }
  const innerWidth = $derived(width - margin.left - margin.right)
  const innerHeight = $derived(height - margin.top - margin.bottom)

  const lines = $derived(brewer.lines)
  const xScale = $derived(brewer.xScale)
  const yScale = $derived(brewer.yScale)
  const symbolMap = $derived(brewer.symbolMap)

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

  const legendItems = $derived(
    Array.from(brewer.colorMap.entries()).map(([key, entry]) => ({
      label: String(key),
      fill: entry.fill,
      shape: symbolMap.get(key) ?? 'circle'
    }))
  )
</script>

<div class="chart-container" data-chart-root data-chart-type="line">
  <svg
    {width}
    {height}
    viewBox="0 0 {width} {height}"
    role="img"
    aria-label="Line chart"
  >
    <g
      class="chart-area"
      transform="translate({margin.left}, {margin.top})"
      data-chart-canvas
    >
      <!-- Grid lines -->
      {#if grid}
        <g class="chart-grid" data-chart-grid>
          {#each gridLines as gl (gl.y)}
            <line
              x1="0"
              y1={gl.y}
              x2={innerWidth}
              y2={gl.y}
              data-chart-grid-line
            />
          {/each}
        </g>
      {/if}

      <!-- Lines -->
      <g class="chart-lines" data-chart-mark="line">
        {#each lines as seg (seg.key ?? seg.d)}
          <path
            d={seg.d}
            fill={seg.fill}
            stroke={seg.stroke}
            stroke-width="2"
            stroke-linejoin="round"
            stroke-linecap="round"
            data-chart-element="line"
          />
        {/each}
      </g>

      <!-- Symbol markers on data points -->
      {#if symbol}
        <g class="chart-symbols" data-chart-mark="symbol">
          {#each lines as seg (seg.key ?? seg.d)}
            {#each seg.points as pt, i (i)}
              {@const shape = symbolMap.get(seg.key) ?? 'circle'}
              <Shape
                x={pt.x}
                y={pt.y}
                size={0.8}
                name={shape}
                fill={seg.stroke}
                stroke={seg.stroke}
                thickness={1}
              />
            {/each}
          {/each}
        </g>
      {/if}

      <!-- X axis -->
      {#if xScale}
        <g class="axis x-axis" transform="translate(0, {innerHeight})" data-chart-axis="x">
          <line x1="0" y1="0" x2={innerWidth} y2="0" data-chart-axis-line />
          {#each xTicks as tick (tick.value)}
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
          {#each yTicks as tick (tick.value)}
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

  <!-- HTML legend (below SVG, styled via base/theme CSS) -->
  {#if legend && legendItems.length > 0}
    <div data-chart-legend>
      {#each legendItems as item (item.label)}
        <div data-chart-legend-item>
          {#if symbol}
            <svg width="20" height="12" data-chart-legend-swatch>
              <line x1="0" y1="6" x2="20" y2="6" stroke={item.fill} stroke-width="2" />
              <Shape x={10} y={6} size={0.6} name={item.shape} fill={item.fill} stroke={item.fill} thickness={1} />
            </svg>
          {:else}
            <span data-chart-legend-swatch style="background-color: {item.fill}"></span>
          {/if}
          <span data-chart-legend-label>{item.label}</span>
        </div>
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

  .chart-symbols {
    pointer-events: none;
  }
</style>
