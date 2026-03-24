<script>
  import { getContext } from 'svelte'

  const state = getContext('plot-state')

  const xGridLines = $derived.by(() => {
    const s = state.xScale
    if (!s || typeof s.bandwidth !== 'function') return []
    return s.domain().map((val) => ({ pos: (s(val) ?? 0) + s.bandwidth() / 2 }))
  })

  const yGridLines = $derived.by(() => {
    const s = state.yScale
    if (!s || typeof s.ticks !== 'function') return []
    return s.ticks(6).map((val) => ({ pos: s(val) }))
  })
</script>

<g class="grid" data-plot-grid>
  {#each yGridLines as line (line.pos)}
    <line x1="0" y1={line.pos} x2={state.innerWidth} y2={line.pos} data-plot-grid-line />
  {/each}
  {#each xGridLines as line (line.pos)}
    <line x1={line.pos} y1="0" x2={line.pos} y2={state.innerHeight} data-plot-grid-line="x" />
  {/each}
</g>

<style>
  [data-plot-grid-line] { stroke: var(--chart-grid-color, currentColor); opacity: 0.15; stroke-dasharray: 2 4; }
</style>
