<script>
  import { getContext } from 'svelte'
  import { toPatternId } from '../lib/brewing/patterns.js'
  import { PATTERNS } from './patterns.js'
  import PatternDef from './PatternDef.svelte'

  /** @type {{ patterns?: Record<string, import('./patterns.js').PatternMark[]> }} */
  let { patterns = PATTERNS } = $props()

  const state = getContext('plot-state')

  const patternDefs = $derived.by(() => {
    const defs = []
    for (const [key, patternName] of (state.patterns ?? new Map()).entries()) {
      const colorEntry = state.colors?.get(key) ?? { fill: '#888', stroke: '#444' }
      defs.push({
        id: toPatternId(String(key)),
        marks: patterns[patternName] ?? [],
        fill: colorEntry.fill,
        stroke: colorEntry.stroke ?? '#444'
      })
    }
    return defs
  })
</script>

{#if patternDefs.length > 0}
  <defs data-plot-pattern-defs>
    {#each patternDefs as def (def.id)}
      <PatternDef id={def.id} marks={def.marks} fill={def.fill} stroke={def.stroke} />
    {/each}
  </defs>
{/if}
