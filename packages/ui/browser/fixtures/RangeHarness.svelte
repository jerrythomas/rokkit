<script lang="ts">
	import Range from '../../src/components/Range.svelte'

	/**
	 * Range is headless — its geometry comes from theme CSS, which isn't loaded
	 * here. This harness supplies the minimum layout a real consumer would, so
	 * the component measures a genuine non-zero track instead of the zeros JSDOM
	 * hands back.
	 */
	const { trackWidth = 200, ...rest }: { trackWidth?: number } & Record<string, unknown> = $props()
</script>

<div data-harness style="width: {trackWidth}px">
	<Range {...rest} />
</div>

<style>
	[data-harness] :global([data-range-track]) {
		position: relative;
		display: block;
		height: 16px;
	}
	/* The element Range binds clientWidth to — it must fill the track. */
	[data-harness] :global([data-range-bar]) {
		display: block;
		width: 100%;
		height: 4px;
	}
	[data-harness] :global([data-range-thumb]) {
		position: absolute;
		top: 0;
		width: 16px;
		height: 16px;
	}
</style>
