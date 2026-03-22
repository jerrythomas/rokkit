<script>
  import Dots from '../patterns/Dots.svelte'
  import CrossHatch from '../patterns/CrossHatch.svelte'
  import Waves from '../patterns/Waves.svelte'
  import Brick from '../patterns/Brick.svelte'
  import Triangles from '../patterns/Triangles.svelte'
  import Circles from '../patterns/Circles.svelte'
  import Tile from '../patterns/Tile.svelte'
  import OutlineCircles from '../patterns/OutlineCircles.svelte'
  import CurvedWave from '../patterns/CurvedWave.svelte'

  const COMPONENTS = { Dots, CrossHatch, Waves, Brick, Triangles, Circles, Tile, OutlineCircles, CurvedWave }
  const SIZE = 10

  /**
   * @type {{ patternMap: Map<unknown, string>, colorMap: Map<unknown, {fill: string, stroke: string}> }}
   */
  let { patternMap, colorMap } = $props()

  const defs = $derived(
    Array.from(patternMap.entries()).map(([key, name]) => {
      const color = colorMap.get(key) ?? { fill: '#ddd', stroke: '#666' }
      return {
        id: `chart-pat-${key}`,
        Component: COMPONENTS[name] ?? null,
        fill: color.fill,
        stroke: color.stroke
      }
    })
  )
</script>

<defs>
  {#each defs as def (def.id)}
    <pattern id={def.id} patternUnits="userSpaceOnUse" width={SIZE} height={SIZE}>
      <rect width={SIZE} height={SIZE} fill={def.fill} />
      {#if def.Component}
        <def.Component fill={def.stroke} stroke={def.stroke} size={SIZE} />
      {/if}
    </pattern>
  {/each}
</defs>
