<script>
	import Code from './Code.svelte'

	let { App, code, language = 'svelte' } = $props()
	let view = $state('preview')
</script>

<div data-demo-root>
	<div data-demo-toggle>
		<button
			data-demo-btn
			aria-pressed={view === 'preview'}
			onclick={() => (view = 'preview')}
			title="Preview"
		>
			<span class="i-solar:eye-bold-duotone"></span>
		</button>
		<button
			data-demo-btn
			aria-pressed={view === 'code'}
			onclick={() => (view = 'code')}
			title="Code"
		>
			<span class="i-solar:code-square-bold-duotone"></span>
		</button>
	</div>

	{#if view === 'preview'}
		<div data-demo-preview>
			{#if App}<App />{/if}
		</div>
	{:else}
		<div data-demo-code>
			<Code content={code} {language} />
		</div>
	{/if}
</div>

<style>
	[data-demo-root] {
		position: relative;
		min-height: 14rem;
		border-radius: 0.5rem;
		border: 1px solid var(--color-surface);
		overflow: hidden;
	}

	[data-demo-toggle] {
		position: absolute;
		top: 0.625rem;
		right: 0.625rem;
		z-index: 20;
		display: flex;
		gap: 2px;
		background: color-mix(in srgb, var(--color-surface) 80%, transparent);
		backdrop-filter: blur(6px);
		border: 1px solid var(--color-surface);
		border-radius: 0.375rem;
		padding: 2px;
	}

	[data-demo-btn] {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.75rem;
		height: 1.75rem;
		border-radius: 0.25rem;
		border: none;
		background: transparent;
		color: var(--color-surface);
		cursor: pointer;
		font-size: 0.875rem;
		transition:
			background 120ms ease,
			color 120ms ease;
	}

	[data-demo-btn][aria-pressed='true'] {
		background: var(--color-surface);
		color: var(--color-on-surface);
	}

	[data-demo-btn]:hover:not([aria-pressed='true']) {
		background: var(--color-surface-z2);
		color: var(--color-surface-z7);
	}

	[data-demo-preview] {
		@apply bg-graph-paper;
		--unit: 20px;
		--size: var(--unit);
		--minor-grid: 0.5px;
		--major-grid: 0px;
		--graph-paper-color: rgba(128, 128, 128, 0.22);

		background-color: var(--color-surface-z0);
		box-shadow: inset 0 2px 10px rgb(0 0 0 / 0.07);

		min-height: 14rem;
		padding: 2rem 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	[data-demo-code] {
		min-height: 14rem;
	}

	[data-demo-code] :global([data-code-root]) {
		border-radius: 0;
		border: none;
	}
</style>
