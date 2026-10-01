<script lang="ts">
	/**
	 * How many levels of a containment tree to materialise.
	 *
	 * The control that makes a large tree readable at all. A radial dendrogram over a whole
	 * codebase renders every leaf on one rim, where each is a fraction of a degree wide and
	 * nothing is legible — show the crates first, then drill. Depth and drilling are the same
	 * idea from two directions: this caps how far DOWN, `focusPath` moves where you start.
	 */
	import { choices } from '../actions/choices.js'
	import { counted, say } from '../messages.js'

	type Props = {
		levels?: number
		max?: number
		onchange?: (value: number) => void
	}

	let { levels = 2, max = 4, onchange }: Props = $props()

	// From 1: depth 0 materialises nothing at all, so offering it is offering a blank canvas.
	const steps = $derived(Array.from({ length: Math.max(1, max) }, (_, i) => i + 1))
</script>

<div
	data-graph-depth-controls
	role="group"
	aria-label={say('levelsShown')}
	use:choices={{ onchoose: (value) => onchange?.(Number(value)) }}
>
	{#each steps as level (level)}
		<button
			type="button"
			data-graph-depth={level}
			data-graph-choice={level}
			data-selected={levels === level ? '' : undefined}
			aria-pressed={levels === level}
			title={counted(level, 'levelOne', 'levelMany')}>{level}</button
		>
	{/each}
</div>
