<script lang="ts">
	/**
	 * How much of each node's row list a card shows.
	 *
	 * A component rather than canvas chrome: only some diagrams have rows to thin, and a
	 * control that moves while the picture does not reads as a broken view. The diagram that
	 * wants it places it; the rest never render it.
	 */
	import { choices } from '../actions/choices.js'
	import { say } from '../messages.js'
	import type { GraphMessageKey } from '../messages.js'
	import type { Density } from '../layout/types.js'

	type Props = {
		density?: Density
		onchange?: (value: Density) => void
	}

	let { density = 'keys', onchange }: Props = $props()

	/** Each level, and the words for it. */
	const LEVELS: [Density, GraphMessageKey, GraphMessageKey][] = [
		['names', 'densityNames', 'densityNamesTitle'],
		['keys', 'densityKeys', 'densityKeysTitle'],
		['full', 'densityFull', 'densityFullTitle']
	]
</script>

<!-- Named, because three unlabelled buttons announce as "Names Keys All" and say nothing
     about what they control. -->
<div
	data-graph-density-controls
	role="group"
	aria-label={say('detailLevel')}
	use:choices={{ onchoose: (value) => onchange?.(value as Density) }}
>
	{#each LEVELS as [value, short, title] (value)}
		<button
			type="button"
			data-graph-density={value}
			data-graph-choice={value}
			data-selected={density === value ? '' : undefined}
			aria-pressed={density === value}
			title={say(title)}>{say(short)}</button
		>
	{/each}
</div>
