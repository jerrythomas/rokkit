<script>
  import Plot from '../Plot.svelte'
  import Area from '../geoms/Area.svelte'

  let {
    data = [],
    x = undefined,
    y = undefined,
    fill = undefined,
    curve = undefined,   // forwarded to Area options
    pattern: _pattern = undefined,   // deferred: geom layer does not yet support pattern fills
    width = 600,
    height = 400,
    mode = 'light',
    grid = true,
    legend = false
  } = $props()
</script>

<Plot {data} {width} {height} {mode} {grid} {legend}>
  <Area {x} {y} color={fill} options={{ curve }} />
</Plot>
