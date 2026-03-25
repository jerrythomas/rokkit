<script>
  import Plot from '../Plot.svelte'
  import Line from '../geoms/Line.svelte'

  /** @type {import('../lib/plot/chartProps.js').LineAreaChartProps} */
  let {
    data = [],
    x = undefined,
    y = undefined,
    color = undefined,
    stat = 'identity',
    symbol = undefined,
    curve = undefined,   // forwarded to Line options
    width = 600,
    height = 400,
    mode = 'light',
    grid = true,
    legend = false
  } = $props()
</script>

<Plot {data} {width} {height} {mode} {grid} {legend}>
  <Line {x} {y} {color} {symbol} {stat} options={{ curve }} />
</Plot>
