<script lang="ts">
	/**
	 * Straight chords or bundled ones.
	 *
	 * A toggle rather than a slider: the useful values are the two ends. Bundled is the reason
	 * the view is readable at all — a few hundred straight chords across a rim are a solid disc
	 * of ink — and straight is what you switch to when you want to see one edge exactly.
	 */
	type Props = {
		bundleTension?: number
		/** Tension used for the bundled state. Holten's 0.85 by default. */
		bundled?: number
		onchange?: (value: number) => void
	}

	let { bundleTension = 0.85, bundled = 0.85, onchange }: Props = $props()

	const on = $derived(bundleTension > 0)
</script>

<button
	type="button"
	data-graph-bundle={on ? 'bundled' : 'straight'}
	aria-pressed={on}
	title={on ? 'Edges follow the hierarchy' : 'Edges run straight across'}
	onclick={() => onchange?.(on ? 0 : bundled)}
>
	<span data-graph-bundle-glyph aria-hidden="true">{on ? '❨' : '／'}</span>
	<span data-graph-control-label>{on ? 'Bundled' : 'Straight'}</span>
</button>
