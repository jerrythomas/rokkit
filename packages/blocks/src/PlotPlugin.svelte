<script lang="ts">
	import { PlotChart, FacetPlot, AnimatedPlot } from '@rokkit/chart'

	let { code }: { code: string } = $props()

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
{:else if result.spec?.facet}
	<FacetPlot {...result.spec} />
{:else if result.spec?.animate}
	<AnimatedPlot {...result.spec} />
{:else}
	<PlotChart spec={result.spec} />
{/if}
