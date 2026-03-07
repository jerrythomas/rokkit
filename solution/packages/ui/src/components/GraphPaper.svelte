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
