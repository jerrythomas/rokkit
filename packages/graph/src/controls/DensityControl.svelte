<script lang="ts">
	/**
	 * How much of each node's row list a card shows.
	 *
	 * A component rather than canvas chrome: only some diagrams have rows to thin, and a
	 * control that moves while the picture does not reads as a broken view. The diagram that
	 * wants it places it; the rest never render it.
	 */
	import type { Density } from '../layout/types.js'

	type Props = {
		density?: Density
		/** Fires with the chosen value. The caller owns the value — this control stores none. */
		onchange?: (value: Density) => void
	}

	let { density = 'keys', onchange }: Props = $props()

	const options: [Density, string, string][] = [
		['names', 'Names', 'Titles only'],
		['keys', 'Keys', 'Key rows only'],
		['full', 'All', 'All rows']
	]
</script>

<!-- Named, because three unlabelled buttons announce as "Names Keys All" and say nothing
     about what they control. -->
<div data-graph-density-controls role="group" aria-label="Detail level">
	{#each options as [value, short, title] (value)}
		<button
			type="button"
			data-graph-density={value}
			data-selected={density === value ? '' : undefined}
			aria-pressed={density === value}
			{title}
			onclick={() => onchange?.(value)}>{short}</button
		>
	{/each}
</div>
