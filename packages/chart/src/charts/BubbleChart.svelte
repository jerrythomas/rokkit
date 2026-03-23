<script>
  import { setContext } from 'svelte'
  import { ChartBrewer } from '../lib/brewing/brewer.svelte.js'

  let {
    data = [],
    x = undefined,
    y = undefined,
    color = undefined,
    symbol = undefined,
    size,               // required: field name for bubble radius
    width = 600,
    height = 400,
    mode = 'light',
    grid = true,
    legend = false
  } = $props()

  const brewer = new ChartBrewer()
  setContext('chart-brewer', brewer)

  $effect(() => {
    const channels = {}
    if (x)      channels.x = x
    if (y)      channels.y = y
    if (color)  channels.color = color
    if (symbol) channels.symbol = symbol
    if (size)   channels.size = size
    brewer.update({ data, channels, width, height, mode })
  })

  const margin = { top: 20, right: 20, bottom: 40, left: 50 }
  const innerWidth  = $derived(width  - margin.left - margin.right)
  const innerHeight = $derived(height - margin.top  - margin.bottom)

  const points     = $derived(brewer.points)
  const xScale     = $derived(brewer.xScale)
  const yScale     = $derived(brewer.yScale)
  const legendGroups = $derived(brewer.legendGroups)

  const xTicks = $derived(
    xScale && typeof xScale.ticks === 'function'
      ? xScale.ticks(5).map((val) => ({ value: val, x: xScale(val) }))
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
</script>

<div data-chart-root data-chart-type="bubble">
  <svg {width} {height} viewBox="0 0 {width} {height}" role="img" aria-label="Bubble chart">
    <g transform="translate({margin.left}, {margin.top})" data-chart-canvas>

      {#if grid}
        <g data-chart-grid>
          {#each gridLines as gline (gline.y)}
            <line x1="0" y1={gline.y} x2={innerWidth} y2={gline.y} data-chart-grid-line />
          {/each}
        </g>
      {/if}

      <g data-chart-mark="point">
        {#each points as pt (`${pt.cx}-${pt.cy}`)}
          <circle
            cx={pt.cx}
            cy={pt.cy}
            r={pt.r ?? 5}
            fill={pt.fill}
            stroke={pt.stroke}
            stroke-width="1"
            data-chart-element="point"
          />
        {/each}
      </g>

      {#if xScale}
        <g transform="translate(0, {innerHeight})" data-chart-axis="x">
          <line x1="0" y1="0" x2={innerWidth} y2="0" data-chart-axis-line />
          {#each xTicks as tick (tick.value)}
            <g transform="translate({tick.x}, 0)">
              <line x1="0" y1="0" x2="0" y2="6" stroke="currentColor" />
              <text x="0" y="9" text-anchor="middle" dominant-baseline="hanging" data-chart-tick-label>
                {tick.value}
              </text>
            </g>
          {/each}
        </g>
      {/if}

      {#if yScale}
        <g data-chart-axis="y">
          <line x1="0" y1="0" x2="0" y2={innerHeight} data-chart-axis-line />
          {#each yTicks as tick (tick.value)}
            <g transform="translate(0, {tick.y})">
              <line x1="-6" y1="0" x2="0" y2="0" stroke="currentColor" />
              <text x="-9" y="0" text-anchor="end" dominant-baseline="middle" data-chart-tick-label>
                {tick.value}
              </text>
            </g>
          {/each}
        </g>
      {/if}

    </g>
  </svg>

  {#if legend && legendGroups.length > 0}
    <div data-chart-legend>
      {#each legendGroups as group}
        {#if legendGroups.length > 1}
          <div data-chart-legend-title>{group.field}</div>
        {/if}
        {#each group.items as item (item.label)}
          <div data-chart-legend-item>
            <span data-chart-legend-swatch style="background-color: {item.fill ?? '#ddd'}"></span>
            <span data-chart-legend-label>{item.label}</span>
          </div>
        {/each}
      {/each}
    </div>
  {/if}
</div>

<style>
  [data-chart-root] { position: relative; width: 100%; height: auto; }
  svg { display: block; overflow: visible; }
  [data-chart-axis] { font-size: 11px; fill: currentColor; }
  [data-chart-grid] { pointer-events: none; }
</style>
