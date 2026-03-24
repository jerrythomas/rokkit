<script>
  import Plot from '../Plot.svelte'
  import Area from '../geoms/Area.svelte'

  let {
    data = [],
    x = undefined,
    y = undefined,
    fill = undefined,
    pattern: _pattern = undefined,
    width = 600,
    height = 400,
    mode = 'light',
    grid = true,
    legend = false
  } = $props()
</script>

<Plot {data} {width} {height} {mode} {grid} {legend}>
  <Area {x} {y} color={fill} />
</Plot>
