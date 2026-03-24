<script>
  import PlotChart from '../Plot.svelte'
  import Bar from '../geoms/Bar.svelte'

  let {
    data = [],
    field,
    valueField,
    stat = 'sum',
    width = 300,
    height = 120,
    mode = 'light'
  } = $props()

  const spec = $derived({
    x: field,
    y: valueField
  })
</script>

<!-- FilterBar must be used inside a <CrossFilter> parent. Does not create its own context. -->
<PlotChart
  {data}
  {spec}
  {width}
  {height}
  {mode}
  grid={false}
  legend={false}
>
  <Bar x={field} y={valueField} {stat} filterable={true} />
</PlotChart>
