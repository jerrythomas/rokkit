<script>
  import Brick from '../patterns/Brick.svelte'
  import Checkerboard from '../patterns/Checkerboard.svelte'
  import CircleGrid from '../patterns/CircleGrid.svelte'
  import Circles from '../patterns/Circles.svelte'
  import CrossDot from '../patterns/CrossDot.svelte'
  import CrossHatch from '../patterns/CrossHatch.svelte'
  import CurvedWave from '../patterns/CurvedWave.svelte'
  import DiagonalLines from '../patterns/DiagonalLines.svelte'
  import DiamondOutline from '../patterns/DiamondOutline.svelte'
  import Diamonds from '../patterns/Diamonds.svelte'
  import Dots from '../patterns/Dots.svelte'
  import Hexagons from '../patterns/Hexagons.svelte'
  import HorizontalLines from '../patterns/HorizontalLines.svelte'
  import OutlineCircles from '../patterns/OutlineCircles.svelte'
  import ScatteredTriangles from '../patterns/ScatteredTriangles.svelte'
  import Tile from '../patterns/Tile.svelte'
  import Triangles from '../patterns/Triangles.svelte'
  import VerticalLines from '../patterns/VerticalLines.svelte'
  import Waves from '../patterns/Waves.svelte'
  import Zigzag from '../patterns/Zigzag.svelte'
  import { toPatternId } from './brewing/patterns.js'

  const COMPONENTS = {
    Brick, Checkerboard, CircleGrid, Circles, CrossDot, CrossHatch, CurvedWave,
    DiagonalLines, DiamondOutline, Diamonds, Dots, Hexagons, HorizontalLines,
    OutlineCircles, ScatteredTriangles, Tile, Triangles, VerticalLines, Waves, Zigzag
  }
  const SIZE = 10

  /**
   * @type {{ patternMap: Map<unknown, string>, colorMap: Map<unknown, {fill: string, stroke: string}> }}
   */
  let { patternMap, colorMap } = $props()

  const defs = $derived(
    Array.from(patternMap.entries()).map(([key, name]) => {
      const color = colorMap.get(key) ?? { fill: '#ddd', stroke: '#666' }
      return {
        id: toPatternId(key),
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
