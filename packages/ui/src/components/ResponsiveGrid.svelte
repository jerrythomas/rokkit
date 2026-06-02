<script lang="ts">
	import type { ResponsiveGridProps } from '../types/responsive-grid.js'

	const {
		minWidth = '240px',
		gap = '1rem',
		maxCols,
		children,
		class: className = ''
	}: ResponsiveGridProps = $props()
</script>

<div
	data-responsive-grid
	class={className || undefined}
	style:--grid-min-width={minWidth}
	style:--grid-gap={gap}
	style:--grid-max-cols={maxCols || undefined}
>
	{@render children()}
</div>
