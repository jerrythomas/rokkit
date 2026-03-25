<script>
  import Plot from '../Plot.svelte'
  import Arc from '../geoms/Arc.svelte'

  /** @type {import('../lib/plot/chartProps.js').PieChartProps} */
  let {
    data = [],
    label = undefined,
    y = undefined,
    fill = undefined,
    pattern = undefined,
    innerRadius = 0,
    labelFn = undefined,
    tooltip = false,
    width = 400,
    height = 400,
    mode = 'light',
    legend = false,
    stat = 'sum'
  } = $props()
</script>

<Plot {data} {width} {height} {mode} grid={false} axes={false} margin={{ top: 10, right: 10, bottom: 10, left: 10 }} {legend} {tooltip}>
  <Arc theta={y} fill={label ?? fill} {pattern} {labelFn} {stat} options={{ innerRadius }} />
</Plot>
