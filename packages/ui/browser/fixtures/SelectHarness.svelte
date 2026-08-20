<script lang="ts">
	// The REAL base stylesheet, not a reimplementation. Select computes
	// --select-dropdown-max-height but it's this CSS that applies it, so a layout
	// test is only meaningful with it loaded. `base/*.css` is structure-only (no
	// colour), which is exactly what a geometry test needs.
	import '../../../themes/src/base/select.css'
	import Select from '../../src/components/Select.svelte'

	/**
	 * Offsets the trigger inside the viewport so the dropdown's computed
	 * coordinates are non-trivial, rather than the all-zero rects JSDOM returns.
	 */
	const {
		offsetTop = 120,
		offsetLeft = 60,
		triggerWidth = 180,
		...rest
	}: {
		offsetTop?: number
		offsetLeft?: number
		triggerWidth?: number
	} & Record<string, unknown> = $props()
</script>

<div data-harness style="padding: {offsetTop}px 0 0 {offsetLeft}px; width: 600px">
	<div style="width: {triggerWidth}px">
		<Select {...rest} />
	</div>
</div>

<style>
	/* base/select.css animates the dropdown in over 150ms. Mid-flight the panel is
	   still transforming, so its bounding box is wrong and Playwright never sees
	   it as "stable" enough to click. Layout assertions want the settled box. */
	[data-harness] :global(*) {
		animation: none !important;
		transition: none !important;
	}
	[data-harness] :global([data-select-trigger]) {
		display: block;
		width: 100%;
		height: 32px;
	}
	[data-harness] :global([data-select-option]) {
		display: block;
		width: 100%;
		height: 24px;
	}
</style>
