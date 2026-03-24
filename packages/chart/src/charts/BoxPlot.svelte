<script>
  import Plot from '../Plot.svelte'
  import Box from '../geoms/Box.svelte'

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
</script>

<Plot {data} {width} {height} {mode} {grid} {legend}>
  <Box {x} {y} color={color ?? fill} />
</Plot>
