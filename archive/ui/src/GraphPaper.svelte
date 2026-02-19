<script>
	let {
		class: className = '',
		unit = '.5rem',
		majorGridSize = 5,
		minorGridThickness = 0.5,
		majorGridThickness = 0.5,
		children
	} = $props()
</script>

<div
	data-graph-paper
	class="flex flex-col {className}"
	style:--unit={unit}
	style:--size="calc( {majorGridSize} * {unit})"
	style:--minor-grid="{minorGridThickness}px"
	style:--major-grid="{majorGridThickness}px"
>
	<content class="flex flex-col">
		{@render children?.()}
	</content>
</div>

<style>
	[data-graph-paper] {
		background-image:
			linear-gradient(currentColor var(--major-grid), transparent var(--major-grid)),
			linear-gradient(90deg, currentColor var(--major-grid), transparent var(--major-grid)),
			linear-gradient(currentColor var(--minor-grid), transparent var(--minor-grid)),
			linear-gradient(90deg, currentColor var(--minor-grid), transparent var(--minor-grid));
		background-size:
			var(--size) var(--size),
			var(--size) var(--size),
			var(--unit) var(--unit),
			var(--unit) var(--unit);
		background-position:
			calc(-1 * var(--minor-grid)) calc(-1 * var(--minor-grid)),
			calc(-1 * var(--minor-grid)) calc(-1 * var(--minor-grid)),
			calc(-1 * var(--minor-grid)) calc(-1 * var(--minor-grid)),
			calc(-1 * var(--minor-grid)) calc(-1 * var(--minor-grid));
	}
</style>
