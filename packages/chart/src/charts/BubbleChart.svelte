<script>
  import Plot from '../Plot.svelte'
  import Point from '../geoms/Point.svelte'

  let {
    data = [],
    x = undefined,
    y = undefined,
    color = undefined,
    symbol: _symbol = undefined,
    size,               // required: field name for bubble radius
    width = 600,
    height = 400,
    mode = 'light',
    grid = true,
    legend = false
  } = $props()
</script>

<Plot {data} {width} {height} {mode} {grid} {legend}>
  <Point {x} {y} {color} {size} />
</Plot>
