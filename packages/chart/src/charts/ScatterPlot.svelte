<script>
  import Plot from '../Plot.svelte'
  import Point from '../geoms/Point.svelte'

  /** @type {import('../lib/plot/chartProps.js').ScatterBubbleChartProps} */
  let {
    data = [],
    x = undefined,
    y = undefined,
    color = undefined,
    symbol = undefined,
    size = undefined,
    width = 600,
    height = 400,
    mode = 'light',
    grid = true,
    legend = false
  } = $props()
</script>

<Plot {data} {width} {height} {mode} {grid} {legend}>
  <Point {x} {y} {color} {size} {symbol} />
</Plot>
