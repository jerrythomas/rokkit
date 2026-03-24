<script>
  import { getContext, onMount, onDestroy } from 'svelte'
  import { buildBoxes } from '../lib/brewing/marks/boxes.js'

  let { x, y, color, stat = 'identity', options = {} } = $props()

  const plotState = getContext('plot-state')
  let id = $state(null)

  onMount(() => {
    id = plotState.registerGeom({ type: 'box', channels: { x, y, color }, stat, options })
  })
  onDestroy(() => { if (id) plotState.unregisterGeom(id) })

  const data   = $derived(id ? plotState.geomData(id) : [])
  const xScale = $derived(plotState.xScale)
  const yScale = $derived(plotState.yScale)
  const colors = $derived(plotState.colors)

  // buildBoxes channels: { x, fill, color } where fill drives box interior, color drives stroke
  const boxes = $derived.by(() => {
    if (!data?.length || !xScale || !yScale) return []
    return buildBoxes(data, { x, fill: x, color }, xScale, yScale, colors)
  })
</script>

{#if boxes.length > 0}
  <g data-plot-geom="box">
    {#each boxes as box (box.cx)}
      {@const x0 = box.cx - box.width / 2}
      {@const xMid = box.cx}
      {@const xCap0 = box.cx - box.whiskerWidth / 2}
      {@const xCap1 = box.cx + box.whiskerWidth / 2}
      <!-- Box body (IQR) -->
      <rect
        x={x0}
        y={box.q3}
        width={box.width}
        height={Math.max(0, box.q1 - box.q3)}
        fill={box.fill}
        stroke={box.stroke ?? 'none'}
        stroke-width="1"
        data-plot-element="box-body"
      />
      <!-- Median line -->
      <line
        x1={x0}
        y1={box.median}
        x2={x0 + box.width}
        y2={box.median}
        stroke={box.stroke ?? box.fill}
        stroke-width="2"
        data-plot-element="box-median"
      />
      <!-- Lower whisker (q1 to iqr_min) -->
      <line
        x1={xMid}
        y1={box.q1}
        x2={xMid}
        y2={box.iqr_min}
        stroke={box.stroke ?? box.fill}
        stroke-width="1"
        data-plot-element="box-whisker"
      />
      <!-- Upper whisker (q3 to iqr_max) -->
      <line
        x1={xMid}
        y1={box.q3}
        x2={xMid}
        y2={box.iqr_max}
        stroke={box.stroke ?? box.fill}
        stroke-width="1"
        data-plot-element="box-whisker"
      />
      <!-- Lower whisker cap -->
      <line
        x1={xCap0}
        y1={box.iqr_min}
        x2={xCap1}
        y2={box.iqr_min}
        stroke={box.stroke ?? box.fill}
        stroke-width="1"
      />
      <!-- Upper whisker cap -->
      <line
        x1={xCap0}
        y1={box.iqr_max}
        x2={xCap1}
        y2={box.iqr_max}
        stroke={box.stroke ?? box.fill}
        stroke-width="1"
      />
      <!-- Outlier rendering deferred: buildBoxes does not compute outliers yet -->
    {/each}
  </g>
{/if}
