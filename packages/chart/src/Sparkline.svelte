<script>
  import { scaleLinear } from 'd3-scale'
  import { line as d3line, area as d3area, curveCatmullRom } from 'd3-shape'

  /**
   * @type {number[] | object[]}
   */
  let {
    data = [],
    field = undefined,
    type = 'line',
    curve = 'linear',
    color = 'primary',
    width = 80,
    height = 24,
    min = undefined,
    max = undefined
  } = $props()

  const values = $derived(
    field ? data.map((d) => Number(d[field])) : data.map(Number)
  )

  const yMin = $derived(min ?? Math.min(...values))
  const yMax = $derived(max ?? Math.max(...values))

  const xScale = $derived(
    scaleLinear().domain([0, values.length - 1]).range([0, width])
  )
  const yScale = $derived(
    scaleLinear().domain([yMin, yMax]).range([height, 0])
  )

  const linePath = $derived.by(() => {
    const gen = d3line().x((_, i) => xScale(i)).y((v) => yScale(v))
    if (curve === 'smooth') gen.curve(curveCatmullRom)
    return gen(values)
  })

  const areaPath = $derived.by(() => {
    const gen = d3area().x((_, i) => xScale(i)).y0(height).y1((v) => yScale(v))
    if (curve === 'smooth') gen.curve(curveCatmullRom)
    return gen(values)
  })

  const barWidth = $derived(Math.max(1, width / values.length - 1))

  const strokeColor = $derived(`rgb(var(--color-${color}-500, 100,116,139))`)
  const fillColor = $derived(`rgba(var(--color-${color}-300), 0.25)`)
</script>

<svg {width} {height} style="overflow: visible; display: block;">
  {#if type === 'line'}
    <path d={linePath} fill="none" stroke={strokeColor} stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" />
  {:else if type === 'area'}
    <path d={areaPath} fill={fillColor} stroke="none" />
    <path d={linePath} fill="none" stroke={strokeColor} stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" />
  {:else if type === 'bar'}
    {#each values as v, i}
      <rect
        x={xScale(i) - barWidth / 2}
        y={yScale(v)}
        width={barWidth}
        height={height - yScale(v)}
        fill={strokeColor}
      />
    {/each}
  {/if}
</svg>
