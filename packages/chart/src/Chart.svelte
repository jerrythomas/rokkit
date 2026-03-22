<script>
  import { setContext } from 'svelte'
  import { ChartBrewer } from './lib/brewing/brewer.svelte.js'

  /**
   * @type {{
   *   spec?: import('./spec/chart-spec.js').ChartSpec,
   *   data?: Object[],
   *   x?: string,
   *   y?: string,
   *   color?: string,
   *   pattern?: string,
   *   fill?: string,
   *   size?: string,
   *   label?: string,
   *   symbol?: string,
   *   width?: number,
   *   height?: number,
   *   mode?: 'light' | 'dark',
   *   children?: import('svelte').Snippet
   * }}
   */
  let {
    spec = undefined,
    data = [],
    x = undefined,
    y = undefined,
    color = undefined,
    pattern = undefined,
    fill = undefined,
    size = undefined,
    label = undefined,
    symbol = undefined,
    width = 600,
    height = 400,
    mode = 'light',
    children
  } = $props()

  const brewer = new ChartBrewer()
  setContext('chart-brewer', brewer)

  $effect(() => {
    if (spec) {
      brewer.update({
        data: spec.data,
        channels: spec.channels,
        width,
        height,
        mode,
        layers: spec.layers
      })
    } else {
      const channels = {}
      if (x)       channels.x = x
      if (y)       channels.y = y
      if (color)   channels.color = color
      if (pattern) channels.pattern = pattern
      if (fill)    channels.fill = fill
      if (size)    channels.size = size
      if (label)   channels.label = label
      if (symbol)  channels.symbol = symbol
      brewer.update({ data, channels, width, height, mode })
    }
  })

</script>

<div class="chart-container" data-chart-root>
  <svg
    {width}
    {height}
    viewBox="0 0 {width} {height}"
    role="img"
    aria-label="Chart visualization"
  >
    <g
      class="chart-area"
      data-chart-canvas
    >
      {@render children?.()}
    </g>
  </svg>
</div>

<style>
  .chart-container {
    position: relative;
    width: 100%;
    height: auto;
  }

  svg {
    display: block;
    overflow: visible;
  }

  .chart-area {
    pointer-events: all;
  }
</style>
