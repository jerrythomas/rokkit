<script lang="ts">
	import { PlotChart, FacetPlot, AnimatedPlot } from '@rokkit/chart'

	let { code }: { code: string } = $props()

	let showCode = $state(false)

	const result = $derived.by(() => {
		try {
			const spec = JSON.parse(code)
			return { spec, error: null }
		} catch (e) {
			return { spec: null, error: e instanceof Error ? e.message : 'Invalid JSON' }
		}
	})
</script>

{#if result.error}
	<div data-block-error class="block-error">
		<span>Plot error: {result.error}</span>
		<details>
			<summary>Raw spec</summary>
			<pre>{code}</pre>
		</details>
	</div>
{:else}
	<div data-plot-plugin>
		<button
			data-plot-code-toggle
			onclick={() => (showCode = !showCode)}
			title={showCode ? 'Show chart' : 'Show code'}
			aria-pressed={showCode}
		>
			{showCode ? 'chart' : '</>'}
		</button>

		{#if showCode}
			<pre data-plot-code>{code}</pre>
		{:else if result.spec?.facet}
			<FacetPlot {...result.spec} />
		{:else if result.spec?.animate}
			<AnimatedPlot {...result.spec} />
		{:else}
			<PlotChart spec={result.spec} />
		{/if}
	</div>
{/if}

<style>
	[data-plot-plugin] {
		position: relative;
	}

	[data-plot-code-toggle] {
		position: absolute;
		top: 0.375rem;
		right: 0.375rem;
		z-index: 1;
		padding: 0.125rem 0.375rem;
		font-size: 0.7rem;
		font-family: monospace;
		line-height: 1;
		border-radius: 0.25rem;
		border: 1px solid currentColor;
		background: transparent;
		color: inherit;
		opacity: 0.4;
		cursor: pointer;
		transition: opacity 150ms ease;
	}

	[data-plot-code-toggle]:hover {
		opacity: 0.8;
	}

	[data-plot-code][data-plot-code] {
		margin: 0;
		padding: 1rem;
		overflow-x: auto;
		font-size: 0.75rem;
		white-space: pre-wrap;
		word-break: break-all;
	}
</style>
