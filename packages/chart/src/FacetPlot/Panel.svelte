<script>
  import PlotChart from '../Plot.svelte'

  let {
    data, x, y, color, geoms = [], helpers = {},
    width, height, mode, grid, legend,
    xDomain, yDomain, colorDomain,
    children
  } = $props()

  // Build spec with domain overrides so PlotState uses them
  const spec = $derived({
    data, x, y, color,
    geoms,
    xDomain,
    yDomain,
    colorDomain
  })
</script>

<PlotChart {spec} {helpers} {width} {height} {mode} {grid} {legend}>
  {@render children?.()}
</PlotChart>
