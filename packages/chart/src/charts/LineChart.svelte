<script>
  import Plot from '../Plot.svelte'
  import Line from '../geoms/Line.svelte'

  let {
    data = [],
    x = undefined,
    y = undefined,
    color = undefined,
    curve = undefined,   // forwarded to Line options
    width = 600,
    height = 400,
    mode = 'light',
    grid = true,
    legend = false
  } = $props()
</script>

<Plot {data} {width} {height} {mode} {grid} {legend}>
  <Line {x} {y} {color} options={{ curve }} />
</Plot>
