<script>
  import { setContext } from 'svelte'
  import { BoxBrewer } from '../lib/brewing/BoxBrewer.svelte.js'

  let {
    data = [],
    x = undefined,
    y = undefined,
    fill = undefined,
    color = undefined,
    width = 600,
    height = 400,
    mode = 'light',
    grid = true,
    legend = false
  } = $props()

  const brewer = new BoxBrewer()
  setContext('chart-brewer', brewer)

  $effect(() => {
    const channels = {}
    if (x)     channels.x = x
    if (y)     channels.y = y
    if (fill)  channels.fill = fill
    if (color) channels.color = color
    brewer.update({ data, channels, width, height, mode })
  })

  const margin = { top: 20, right: 20, bottom: 40, left: 50 }
  const innerWidth  = $derived(width  - margin.left - margin.right)
  const innerHeight = $derived(height - margin.top  - margin.bottom)

  const boxes      = $derived(brewer.boxes)
  const xScale     = $derived(brewer.xScale)
  const yScale     = $derived(brewer.yScale)
  const legendGroups = $derived(brewer.legendGroups)

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
</script>

<div class="chart-container" data-chart-root data-chart-type="box">
  <svg {width} {height} viewBox="0 0 {width} {height}" role="img" aria-label="Box plot">
    <g class="chart-area" transform="translate({margin.left}, {margin.top})" data-chart-canvas>

      {#if grid}
        <g class="chart-grid" data-chart-grid>
          {#each gridLines as line (line.y)}
            <line x1="0" y1={line.y} x2={innerWidth} y2={line.y} data-chart-grid-line />
          {/each}
        </g>
      {/if}

      <g class="chart-boxes" data-chart-mark="box">
        {#each boxes as box (box.data[x])}
          <g data-chart-element="box">
            <!-- Whisker line: iqr_min → iqr_max -->
            <line
              x1={box.cx} y1={box.iqr_min}
              x2={box.cx} y2={box.iqr_max}
              stroke={box.stroke ?? box.fill} stroke-width="1.5"
            />
            <!-- Whisker caps -->
            <line
              x1={box.cx - box.whiskerWidth / 2} y1={box.iqr_min}
              x2={box.cx + box.whiskerWidth / 2} y2={box.iqr_min}
              stroke={box.stroke ?? box.fill} stroke-width="1.5"
            />
            <line
              x1={box.cx - box.whiskerWidth / 2} y1={box.iqr_max}
              x2={box.cx + box.whiskerWidth / 2} y2={box.iqr_max}
              stroke={box.stroke ?? box.fill} stroke-width="1.5"
            />
            <!-- IQR rectangle -->
            <rect
              x={box.cx - box.width / 2}
              y={box.q3}
              width={box.width}
              height={Math.abs(box.q1 - box.q3)}
              fill={box.fill}
              stroke={box.stroke ?? box.fill}
              stroke-width="1"
            />
            <!-- Median line -->
            <line
              x1={box.cx - box.width / 2} y1={box.median}
              x2={box.cx + box.width / 2} y2={box.median}
              stroke={box.stroke ?? box.fill} stroke-width="2"
            />
          </g>
        {/each}
      </g>

      {#if xScale}
        <g class="axis x-axis" transform="translate(0, {innerHeight})" data-chart-axis="x">
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
        <g class="axis y-axis" data-chart-axis="y">
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
  .chart-container { position: relative; width: 100%; height: auto; }
  svg { display: block; overflow: visible; }
  .axis { font-size: 11px; fill: currentColor; }
  .chart-grid { pointer-events: none; }
</style>
