<script lang="ts">
	import type { Snippet } from 'svelte'

	interface ResponsiveGridProps {
		/** Minimum column width (CSS value) */
		minWidth?: string
		/** Gap between cells (CSS value) */
		gap?: string
		/** Maximum number of columns */
		maxCols?: number
		/** Grid children */
		children: Snippet
		/** Additional CSS class */
		class?: string
	}

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
