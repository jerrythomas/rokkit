<script lang="ts">
	import type { Snippet } from 'svelte'

	let {
		title,
		description = '',
		preview,
		controls
	}: {
		title: string
		description?: string
		preview: Snippet
		controls?: Snippet
	} = $props()
</script>

<div class="playground">
	<div class="playground-header">
		<h2>{title}</h2>
		{#if description}<p>{description}</p>{/if}
	</div>

	<div class="playground-body">
		<div class="preview-area">
			{@render preview()}
		</div>

		{#if controls}
			<aside class="controls-panel">
				<h3>Properties</h3>
				<div class="controls-body">
					{@render controls()}
				</div>
			</aside>
		{/if}
	</div>
</div>

<style>
	.playground {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.playground-header {
		flex-shrink: 0;
		margin-bottom: 1rem;
	}

	.playground-header h2 {
		margin: 0 0 0.25rem;
		font-size: 1.5rem;
		color: rgb(var(--color-surface-900));
	}

	.playground-header p {
		margin: 0;
		font-size: 0.8125rem;
		color: rgb(var(--color-surface-500));
	}

	.playground-body {
		flex: 1;
		display: grid;
		grid-template-columns: 1fr 280px;
		gap: 1rem;
		min-height: 0;
	}

	.preview-area {
		padding: 1.5rem;
		border: 1px solid rgb(var(--color-surface-200));
		border-radius: 0.5rem;
		background: rgb(var(--color-surface-50));
		overflow: auto;
	}

	.controls-panel {
		border: 1px solid rgb(var(--color-surface-200));
		border-radius: 0.5rem;
		background: rgb(var(--color-surface-50));
		overflow-y: auto;
	}

	.controls-panel h3 {
		margin: 0;
		padding: 0.625rem 0.75rem;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: rgb(var(--color-surface-500));
		border-bottom: 1px solid rgb(var(--color-surface-200));
	}

	.controls-body {
		padding: 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
</style>
