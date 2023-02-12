<script>
  import { aggregate, getScales } from '../lib/utils'

  import BoxPlot from './BoxPlot.svelte'
  import ScatterPlot from './ScatterPlot.svelte'

  export let data
  export let width
  export let height
  export let x
  export let y
  export let plots = []

  $: nested = aggregate(data, x, y)
  $: scales = getScales(data, x, y, width, height)
</script>

<svg viewBox="0 0 {width} {height}">
  {#if plots.includes('box')}
    <BoxPlot data={nested} {...scales} />
  {/if}
  {#if plots.includes('scatter')}
    <ScatterPlot {data} {x} {y} {...scales} />
  {/if}
</svg>
