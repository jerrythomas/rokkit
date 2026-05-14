<script lang="ts">
	import type { Snippet } from 'svelte'

	let {
		grid = true,
		gridSize = 24,
		gridColor = 'var(--canvas-grid-color, color-mix(in oklch, var(--color-surface-z2), transparent 70%))',
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
	style="--grid-size: {gridSize}px; --grid-color: {gridColor};"
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
		min-height: 100vh;
		background: var(--color-surface-z1);
	}
	.canvas.has-grid {
		background-color: var(--color-surface-z1);
		background-image: radial-gradient(circle, var(--grid-color) 1px, transparent 1px);
		background-size: var(--grid-size) var(--grid-size);
	}
	.toolbar {
		flex: 0 0 auto;
		padding: 12px 24px;
		border-bottom: 1px solid var(--color-surface-z2);
		background: var(--color-surface-z1);
	}
	.content {
		flex: 1 1 auto;
		padding: 32px;
	}
</style>
