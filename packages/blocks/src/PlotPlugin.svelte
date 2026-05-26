<script lang="ts">
	import { PlotChart, FacetPlot, AnimatedPlot } from '@rokkit/chart'
	import { CodeBlock } from '@rokkit/ui'
	import { pluginDisplay } from './config.svelte.js'

	interface Props {
		/** Raw fence body — the JSON plot spec as it came from the markdown. */
		code: string
	}

	const { code }: Props = $props()

	let showCode = $state(false)

	const parsed = $derived.by(() => {
		try {
			return { spec: JSON.parse(code), error: null as string | null }
		} catch (e) {
			return { spec: null, error: e instanceof Error ? e.message : 'Invalid JSON' }
		}
	})

	const spec = $derived(parsed.spec)

	// Summary line: rows + the field-to-channel mapping ("x=quarter · y=revenue · fill=product").
	// PlotChart owns the title and all other rendering — the plugin's only
	// additions are the summary line and (optional) view-code affordance.
	const summary = $derived.by(() => {
		if (!spec) return ''
		const parts: string[] = []
		const rows = Array.isArray(spec.data) ? spec.data.length : 0
		if (rows) parts.push(`rows=${rows}`)
		const channels: Array<[string, string | undefined]> = [
			['x', spec.x],
			['y', spec.y],
			['fill', spec.fill ?? spec.color]
		]
		for (const [name, field] of channels) {
			if (typeof field === 'string' && field) parts.push(`${name}=${field}`)
		}
		return parts.join(' · ')
	})
</script>

{#if parsed.error}
	<div data-block-error class="block-error">
		<span>Plot error: {parsed.error}</span>
		<details>
			<summary>Raw spec</summary>
			<pre>{code}</pre>
		</details>
	</div>
{:else}
	<div data-plot-plugin>
		{#if pluginDisplay.codeVisible}
			<div data-plot-header>
				<button
					type="button"
					data-plot-code-toggle
					onclick={() => (showCode = !showCode)}
					aria-pressed={showCode}
					title={showCode ? 'Hide code' : 'Show code'}
				>
					<span class={showCode ? 'i-mdi:eye-off-outline' : 'i-mdi:code-tags'} aria-hidden="true"></span>
					<span>{showCode ? 'Hide code' : 'View code'}</span>
				</button>
			</div>
		{/if}

		<div data-plot-body>
			{#if spec?.facet}
				<FacetPlot {...spec} />
			{:else if spec?.animate}
				<AnimatedPlot {...spec} />
			{:else}
				<PlotChart {spec} />
			{/if}
		</div>

		{#if summary}
			<div data-plot-summary>{summary}</div>
		{/if}

		{#if showCode && pluginDisplay.codeVisible}
			<div data-plot-code>
				<CodeBlock
					{code}
					language="plot"
					allowCopy={pluginDisplay.allowCopy}
					allowDownload={pluginDisplay.allowDownload}
				/>
			</div>
		{/if}
	</div>
{/if}

<style>
	[data-plot-plugin] {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	[data-plot-header] {
		display: flex;
		align-items: center;
		justify-content: flex-end;
	}

	[data-plot-code-toggle] {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		height: 24px;
		padding: 0 8px;
		border: 1px solid var(--paper-edge);
		border-radius: 4px;
		background: var(--paper);
		color: var(--ink-mute);
		font: 500 11.5px var(--font-ui);
		cursor: pointer;
	}

	[data-plot-code-toggle]:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	[data-plot-code-toggle] > span:first-child {
		width: 14px;
		height: 14px;
	}

	[data-plot-summary] {
		font: 500 11px var(--font-mono);
		letter-spacing: 0.04em;
		color: var(--ink-mute);
	}

	[data-plot-code] {
		margin-top: 4px;
	}
</style>
