<script lang="ts">
	/**
	 * An on/off control — the shape of every graph toggle (violations, hidden pairs, bundling,
	 * edge style). It reports the state the reader asked for; each public control maps that
	 * back to its own value and keeps its own `data-*` hook. Internal: not exported.
	 */
	import { choices } from '../actions/choices.js'

	type Props = {
		pressed: boolean
		label: string
		title: string
		/** A glyph beside the label, decorative. */
		glyph?: string
		/** The control's own style hooks, e.g. `{ 'data-graph-bundle': 'bundled' }`. */
		hooks?: Record<string, string>
		onchange?: (pressed: boolean) => void
	}

	let { pressed, label, title, glyph = undefined, hooks = {}, onchange }: Props = $props()
</script>

<button
	type="button"
	{...hooks}
	aria-pressed={pressed}
	{title}
	data-graph-choice={pressed ? 'off' : 'on'}
	use:choices={{ onchoose: (next) => onchange?.(next === 'on') }}
>
	{#if glyph}<span data-graph-control-glyph aria-hidden="true">{glyph}</span>{/if}
	<span data-graph-control-label>{label}</span>
</button>
