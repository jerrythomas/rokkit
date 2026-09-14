<script>
	import { getContext } from 'svelte'
	const presetCtx = getContext('chart-preset')

	// Reading `.current` is the point of the context — the provider exposes it as a
	// GETTER so consumers re-read the live preset rather than capture it once.
	// Previously nothing read it, so "works with a custom preset prop" could not
	// tell whether the preset had reached the consumer at all.
	const colors = $derived(presetCtx?.current?.colors ?? [])
</script>

<span
	data-testid="preset-consumer"
	data-preset-set={String(presetCtx !== null && presetCtx !== undefined)}
	data-preset-colors={colors.join(',')}
></span>
