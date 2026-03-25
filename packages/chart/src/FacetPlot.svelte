<script>
  import { splitByField, getFacetDomains } from './lib/plot/facet.js'
  import { distinct } from './lib/brewing/colors.js'
  import PlotPanel from './FacetPlot/Panel.svelte'

  /**
   * @type {{
   *   data: Object[],
   *   facet: { by: string, cols?: number, scales?: 'fixed'|'free'|'free_x'|'free_y' },
   *   x?: string,
   *   y?: string,
   *   color?: string,
   *   geoms?: import('./lib/plot/types.js').GeomSpec[],
   *   helpers?: import('./lib/plot/types.js').PlotHelpers,
   *   panelWidth?: number,
   *   panelHeight?: number,
   *   width?: number,
   *   height?: number,
   *   mode?: 'light' | 'dark',
   *   grid?: boolean,
   *   legend?: boolean,
   *   children?: import('svelte').Snippet
   * }}
   */
  let {
    data = [],
    facet,
    x,
    y,
    fill,
    color,
    geoms = [],
    helpers = {},
    panelWidth,
    panelHeight,
    width = 900,
    height = 300,
    mode = 'light',
    grid = true,
    legend = false,
    children
  } = $props()

  // `fill` is accepted as an alias for `color` (bar/area semantics vs line/point)
  const colorChannel = $derived(fill ?? color)

  const panels  = $derived(splitByField(data, facet.by))
  const scales  = $derived(facet.scales ?? 'fixed')
  const domains = $derived(
    x && y ? getFacetDomains(panels, { x, y }, scales) : new Map()
  )

  // Global color domain ensures the same value maps to the same color in every panel.
  const colorDomain = $derived(colorChannel ? distinct(data, colorChannel) : undefined)

  const cols = $derived(facet.cols ?? Math.min(panels.size, 3))
  const pw   = $derived(panelWidth  ?? Math.floor(width / cols))
  const ph   = $derived(panelHeight ?? height)
</script>

<div data-facet-grid style:--facet-cols={cols}>
  {#each [...panels.entries()] as [facetValue, panelData] (`${facetValue}`)}
    <div data-facet-panel data-facet-value={facetValue}>
      <div data-facet-title>{facetValue}</div>
      <PlotPanel
        data={panelData}
        {x} {y} color={colorChannel}
        {geoms} {helpers}
        width={pw}
        height={ph}
        {mode} {grid}
        legend={false}
        xDomain={domains.get(facetValue)?.xDomain}
        yDomain={domains.get(facetValue)?.yDomain}
        {colorDomain}
      >
        <!-- Render caller-supplied geoms inside every panel (each gets its own PlotState context) -->
        {@render children?.()}
      </PlotPanel>
    </div>
  {/each}
</div>

<!-- Single shared legend outside the grid -->
{#if legend}
  <div data-facet-legend>
    <!-- Legend content rendered by first panel; simplified for now -->
  </div>
{/if}

