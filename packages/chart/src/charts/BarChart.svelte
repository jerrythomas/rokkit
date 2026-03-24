<script>
  import Plot from '../Plot.svelte'
  import Bar from '../geoms/Bar.svelte'

  let {
    data = [],
    x = undefined,
    y = undefined,
    fill = undefined,   // mapped to color channel
    pattern: _pattern = undefined,
    width = 600,
    height = 400,
    mode = 'light',
    grid = true,
    legend = false,
    stat = 'identity'
  } = $props()
</script>

<Plot {data} {width} {height} {mode} {grid} {legend}>
  <Bar {x} {y} color={fill} {stat} />
</Plot>
