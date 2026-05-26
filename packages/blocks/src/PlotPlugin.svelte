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
	let bodyRef = $state<HTMLDivElement | null>(null)

	const parsed = $derived.by(() => {
		try {
			return { spec: JSON.parse(code), error: null as string | null }
		} catch (e) {
			return { spec: null, error: e instanceof Error ? e.message : 'Invalid JSON' }
		}
	})

	const spec = $derived(parsed.spec)

	// Pretty-print the spec for the code-view panel. Falls back to the raw
	// fence body if parsing failed so the user can still see what went in.
	const prettyCode = $derived(
		spec ? JSON.stringify(spec, null, 2) : code
	)

	// Summary line: rows + the field-to-channel mapping
	// ("x=quarter · y=revenue · fill=product").
	// PlotChart owns the title and all other rendering — the plugin's only
	// additions are the summary line and (optional) developer affordances.
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

	function downloadSvg() {
		if (!bodyRef) return
		const svg = bodyRef.querySelector('svg')
		if (!svg) return
		const serialized = new XMLSerializer().serializeToString(svg)
		const blob = new Blob([serialized], { type: 'image/svg+xml' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = (spec?.title?.replace(/\s+/g, '-').toLowerCase() ?? 'chart') + '.svg'
		a.click()
		URL.revokeObjectURL(url)
	}
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
					data-plot-export
					onclick={downloadSvg}
					title="Download chart as SVG"
				>
					<span class="i-mdi:image-outline" aria-hidden="true"></span>
					<span>SVG</span>
				</button>
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

		<div data-plot-body bind:this={bodyRef}>
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
					code={prettyCode}
					language="plot"
					allowCopy={true}
					allowDownload={true}
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
		gap: 4px;
	}

	[data-plot-code-toggle],
	[data-plot-export] {
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

	[data-plot-code-toggle]:hover,
	[data-plot-export]:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	[data-plot-code-toggle] > span:first-child,
	[data-plot-export] > span:first-child {
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
