<script lang="ts">
	/**
	 * Straight chords or bundled ones.
	 *
	 * A toggle rather than a slider: the useful values are the two ends. Bundled is the reason
	 * the view is readable at all — a few hundred straight chords across a rim are a solid disc
	 * of ink — and straight is what you switch to when you want to see one edge exactly.
	 */
	import ToggleControl from './ToggleControl.svelte'
	import { say } from '../messages.js'

	type Props = {
		bundleTension?: number
		/** Tension used for the bundled state. Holten's 0.85 by default. */
		bundled?: number
		onchange?: (value: number) => void
	}

	let { bundleTension = 0.85, bundled = 0.85, onchange }: Props = $props()

	const on = $derived(bundleTension > 0)
</script>

<ToggleControl
	pressed={on}
	hooks={{ 'data-graph-bundle': on ? 'bundled' : 'straight' }}
	glyph={on ? '❨' : '／'}
	label={say(on ? 'bundled' : 'straight')}
	title={say(on ? 'bundledTitle' : 'straightTitle')}
	onchange={(next) => onchange?.(next ? bundled : 0)}
/>
