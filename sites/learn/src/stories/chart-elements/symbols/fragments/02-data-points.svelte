<script>
  import { Symbol } from '@rokkit/chart'
  import { swatch } from '@rokkit/chart/lib'
  import { get } from 'svelte/store'

  const swatchData = get(swatch)

  // Example data points for a scatter plot
  const dataPoints = [
    { x: 20, y: 30, category: 'A' },
    { x: 50, y: 60, category: 'B' },
    { x: 80, y: 20, category: 'A' },
    { x: 40, y: 80, category: 'C' }
  ]

  // Symbol mapping by category
  const symbols = { A: 'circle', B: 'square', C: 'triangle' }
  const colors = {
    A: swatchData.palette.blue[500],
    B: swatchData.palette.green[500],
    C: swatchData.palette.orange[500]
  }
</script>

<svg viewBox="0 0 100 100">
  {#each dataPoints as point}
    <Symbol
      x={point.x}
      y={point.y}
      name={symbols[point.category]}
      size={6}
      fill={colors[point.category]}
      stroke={colors[point.category]}
    />
  {/each}
</svg>