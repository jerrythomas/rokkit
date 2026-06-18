<script lang="ts">
	import { getContext } from 'svelte'
	import type { PatternMark } from './patterns.js'
	import type { PlotState } from '../PlotState.svelte.js'
	import { toPatternId } from '../lib/brewing/patterns.js'
	import { PATTERNS } from './patterns.js'
	import PatternDef from './PatternDef.svelte'

	type Props = {
		patterns?: Record<string, PatternMark[]>
	}

	let { patterns = PATTERNS }: Props = $props()

	const state = getContext<PlotState>('plot-state')

	const patternDefs = $derived.by(() => {
		const defs = []
		for (const [key, patternName] of (state.patterns ?? new Map()).entries()) {
			const colorEntry = state.colors?.get(key) ?? { stroke: '#444' }
			defs.push({
				id: toPatternId(String(key)),
				marks: patterns[patternName] ?? [],
				stroke: colorEntry.stroke ?? '#444'
			})
		}
		return defs
	})
</script>

{#if patternDefs.length > 0}
	<defs data-plot-pattern-defs>
		{#each patternDefs as def (def.id)}
			<PatternDef id={def.id} marks={def.marks} stroke={def.stroke} />
		{/each}
	</defs>
{/if}
