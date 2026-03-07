<script>
	// @ts-nocheck
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
		border-radius: 0.5rem;
		border: 1px solid var(--color-surface-z3);
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
		border: 1px solid var(--color-surface-z2);
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
		color: var(--color-surface-z5);
		cursor: pointer;
		font-size: 0.875rem;
		transition:
			background 120ms ease,
			color 120ms ease;
	}

	[data-demo-btn][aria-pressed='true'] {
		background: var(--color-surface-z3);
		color: var(--color-on-surface);
	}

	[data-demo-btn]:hover:not([aria-pressed='true']) {
		background: var(--color-surface-z2);
		color: var(--color-surface-z7);
	}

	/*
	 * Graph paper preview area — minor grid only, no major grid.
	 * Variables:
	 *   --preview-unit       minor cell size      (default 20px)
	 *   --preview-line-size  minor line thickness  (default 0.5px)
	 *   --preview-line       line color            (default neutral gray 20%)
	 */
	[data-demo-preview] {
		--preview-unit: 20px;
		--preview-line-size: 0.5px;
		--preview-line: rgb(var(--color-surface-200, 128 128 128) / 0.22);

		background-color: var(--color-surface-z0);
		background-image:
			linear-gradient(
				var(--preview-line) var(--preview-line-size),
				transparent var(--preview-line-size)
			),
			linear-gradient(
				90deg,
				var(--preview-line) var(--preview-line-size),
				transparent var(--preview-line-size)
			);
		background-size: var(--preview-unit) var(--preview-unit);
		background-position:
			calc(-1 * var(--preview-line-size)) calc(-1 * var(--preview-line-size)),
			calc(-1 * var(--preview-line-size)) calc(-1 * var(--preview-line-size));
		box-shadow: inset 0 2px 10px rgb(0 0 0 / 0.07);

		min-height: 14rem;
		padding: 2rem 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	[data-demo-code] :global([data-code-root]) {
		border-radius: 0;
		border: none;
	}
</style>
