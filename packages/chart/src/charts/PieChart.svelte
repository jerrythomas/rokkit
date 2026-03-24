<script>
  import Plot from '../Plot.svelte'
  import Arc from '../geoms/Arc.svelte'

  let {
    data = [],
    label = undefined,
    y = undefined,
    fill = undefined,
    pattern = undefined,
    innerRadius = 0,
    width = 400,
    height = 400,
    mode = 'light',
    legend = false,
    stat = 'sum'
  } = $props()
</script>

<Plot {data} {width} {height} {mode} grid={false} {legend}>
  <Arc theta={y} color={label ?? fill} {stat} options={{ innerRadius }} />
</Plot>
