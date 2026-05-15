<script lang="ts">
	import type { Snippet } from 'svelte'

	let {
		grid = true,
		gridSize = 24,
		gridColor = '',
		toolbar,
		children
	}: {
		grid?: boolean
		gridSize?: number
		gridColor?: string
		toolbar?: Snippet
		children?: Snippet
	} = $props()
</script>

<section
	class="canvas"
	class:has-grid={grid}
	style="--grid-size: {gridSize}px;{gridColor ? ` --grid-color: ${gridColor};` : ''}"
>
	{#if toolbar}
		<div class="toolbar">{@render toolbar()}</div>
	{/if}
	<div class="content">
		{@render children?.()}
	</div>
</section>

<style>
	.canvas {
		display: flex;
		flex-direction: column;
		height: 100vh;
		overflow-y: auto;
		@apply bg-surface-z1;
	}
	.canvas.has-grid {
		@apply bg-surface-z1 text-surface-z3;
		background-image: radial-gradient(circle, var(--grid-color, currentColor) 1px, transparent 1px);
		background-size: var(--grid-size) var(--grid-size);
	}
	.toolbar {
		flex: 0 0 auto;
		position: sticky;
		top: 0;
		z-index: 1;
		padding: 12px 24px;
		@apply border-b border-surface-z2 bg-surface-z1;
	}
	.content {
		flex: 1 1 auto;
		padding: 32px;
	}
</style>
