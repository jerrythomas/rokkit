<script lang="ts">
	import ResponsiveGrid from '../src/components/ResponsiveGrid.svelte'

	const {
		minWidth = '240px',
		gap = '1rem',
		maxCols,
		class: className = ''
	}: {
		minWidth?: string
		gap?: string
		maxCols?: number
		class?: string
	} = $props()
</script>

<ResponsiveGrid {minWidth} {gap} {maxCols} class={className}>
	<div data-grid-child>Cell 1</div>
	<div data-grid-child>Cell 2</div>
	<div data-grid-child>Cell 3</div>
</ResponsiveGrid>
