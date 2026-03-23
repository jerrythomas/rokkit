<script>
  import { setContext } from 'svelte'
  import { PieBrewer } from '../lib/brewing/PieBrewer.svelte.js'
  import ChartPatternDefs from '../lib/ChartPatternDefs.svelte'
  import { toPatternId } from '../lib/brewing/patterns.js'

  /**
   * @type {{
   *   data?: Object[],
   *   label?: string,
   *   y?: string,
   *   fill?: string,
   *   pattern?: string,
   *   width?: number,
   *   height?: number,
   *   mode?: 'light' | 'dark',
   *   legend?: boolean,
   *   stat?: string
   * }}
   */
  let {
    data = [],
    label = undefined,
    y = undefined,
    fill = undefined,
    pattern = undefined,
    width = 400,
    height = 400,
    mode = 'light',
    legend = false,
    stat = 'sum'
  } = $props()

  const brewer = new PieBrewer()
  setContext('chart-brewer', brewer)

  $effect(() => {
    const channels = {}
    if (label) channels.label = label
    if (y)     channels.y = y
    if (fill)  channels.fill = fill
    if (pattern) channels.pattern = pattern
    brewer.update({ data, channels, width, height, mode, stat })
  })

  // Derived chart data from brewer
  const arcs = $derived(brewer.arcs)
  const patternDefs = $derived(brewer.patternDefs)

  const legendGroups = $derived(brewer.legendGroups)
  const legendAllItems = $derived(
    legendGroups.flatMap((g, gi) =>
      legendGroups.length > 1
        ? [{ _title: g.field, _gi: gi }, ...g.items]
        : g.items
    )
  )
</script>

<div data-chart-root data-chart-type="pie">
  <svg
    {width}
    {height}
    viewBox="0 0 {width} {height}"
    role="img"
    aria-label="Pie chart"
  >
    {#if patternDefs.length > 0}
      <ChartPatternDefs defs={patternDefs} />
    {/if}

    <!-- Arcs centered in the SVG -->
    {#if arcs && arcs.length > 0}
      <g
        data-chart-mark="arc"
        transform="translate({width / 2}, {height / 2})"
      >
        {#each arcs as arc (arc.key)}
          {@const patternId = patternDefs.length > 0 ? patternDefs.find(d => d.id === toPatternId(arc.key))?.id ?? null : null}
          <path
            d={arc.d}
            fill={patternId ? `url(#${patternId})` : arc.fill}
            stroke={arc.stroke}
            stroke-width="1"
            data-chart-element="arc"
          />
        {/each}
      </g>
    {/if}

    <!-- Legend -->
    {#if legend && legendGroups.length > 0}
      <g transform="translate(10, 10)" data-chart-legend>
        {#each legendAllItems as item, i}
          {#if item._title}
            <text x="0" y={i * 20 + 9} font-size="9" fill="currentColor" font-weight="bold" data-chart-legend-title>{item._title}</text>
          {:else}
            <g transform="translate(0, {i * 20})">
              {#if item.patternId}
                <svg x="0" y="0" width="10" height="10">
                  <rect width="10" height="10" fill={item.fill ?? '#ddd'} data-chart-legend-marker />
                  <rect width="10" height="10" fill="url(#{item.patternId})" />
                </svg>
              {:else}
                <rect width="10" height="10" fill={item.fill ?? '#ddd'} data-chart-legend-marker />
              {/if}
              <text x="14" y="9" text-anchor="start" data-chart-legend-label>{item.label}</text>
            </g>
          {/if}
        {/each}
      </g>
    {/if}
  </svg>
</div>

<style>
  [data-chart-root] {
    position: relative;
    width: 100%;
    height: auto;
  }

  svg {
    display: block;
    overflow: visible;
  }

  [data-chart-legend] {
    font-size: 11px;
    fill: currentColor;
  }
</style>
