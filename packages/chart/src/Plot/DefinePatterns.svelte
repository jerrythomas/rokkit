<script>
  import { getContext } from 'svelte'
  import { toPatternId } from '../lib/brewing/patterns.js'
  import NamedPattern from '../patterns/paths/NamedPattern.svelte'

  const state = getContext('plot-state')

  const patternDefs = $derived.by(() => {
    const defs = []
    for (const [key, patternName] of (state.patterns ?? new Map()).entries()) {
      const colorEntry = state.colors?.get(key) ?? { fill: '#888' }
      defs.push({
        id: toPatternId(String(key)),
        patternName,
        fill: colorEntry.fill
      })
    }
    return defs
  })
</script>

{#if patternDefs.length > 0}
  <defs data-plot-pattern-defs>
    {#each patternDefs as def (def.id)}
      <pattern id={def.id} patternUnits="userSpaceOnUse" width="10" height="10">
        <rect width="10" height="10" fill={def.fill} />
        <NamedPattern name={def.patternName} />
      </pattern>
    {/each}
  </defs>
{/if}
