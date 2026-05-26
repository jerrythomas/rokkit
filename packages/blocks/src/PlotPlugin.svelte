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
	const prettyCode = $derived(spec ? JSON.stringify(spec, null, 2) : code)

	// Summary: rows + channel mapping (rows[N] · x field · y field · fill field).
	// Each part is a label+value pair so themes can decorate them
	// differently (the /app surface formats values like "rows[4]").
	const summary = $derived.by(() => {
		if (!spec) return [] as Array<{ label: string; value: string }>
		const parts: Array<{ label: string; value: string }> = []
		const rows = Array.isArray(spec.data) ? spec.data.length : 0
		if (rows) parts.push({ label: 'rows', value: `[${rows}]` })
		const channels: Array<[string, string | undefined]> = [
			['x', spec.x],
			['y', spec.y],
			['fill', spec.fill ?? spec.color]
		]
		for (const [name, field] of channels) {
			if (typeof field === 'string' && field) parts.push({ label: name, value: field })
		}
		return parts
	})

	async function copyCode() {
		try {
			await navigator.clipboard.writeText(prettyCode)
		} catch {
			// clipboard may be unavailable (insecure context); silent fail.
		}
	}

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
		<div data-plot-body bind:this={bodyRef}>
			{#if spec?.facet}
				<FacetPlot {...spec} />
			{:else if spec?.animate}
				<AnimatedPlot {...spec} />
			{:else}
				<PlotChart {spec} />
			{/if}
		</div>

		<div data-plot-footer>
			{#if summary.length}
				<div data-plot-summary>
					{#each summary as part, i (part.label)}
						{#if i > 0}<span data-sep>·</span>{/if}
						<span data-plot-summary-label>{part.label}</span>
						<span data-plot-summary-value>{part.value}</span>
					{/each}
				</div>
			{:else}
				<span></span>
			{/if}

			{#if pluginDisplay.codeVisible}
				<div data-plot-actions>
					<button
						type="button"
						data-plot-action
						data-plot-code-toggle
						onclick={() => (showCode = !showCode)}
						aria-pressed={showCode}
						title={showCode ? 'Hide code' : 'View code'}
					>
						<span class={showCode ? 'i-mdi:eye-off-outline' : 'i-mdi:code-tags'} aria-hidden="true"></span>
						<span>{showCode ? 'Hide code' : 'View code'}</span>
					</button>
					<button type="button" data-plot-action onclick={copyCode} title="Copy spec to clipboard">
						<span class="i-mdi:content-copy" aria-hidden="true"></span>
						<span>Copy code</span>
					</button>
					<button type="button" data-plot-action onclick={downloadSvg} title="Download chart as SVG">
						<span class="i-mdi:download" aria-hidden="true"></span>
						<span>Export SVG</span>
					</button>
				</div>
			{/if}
		</div>

	</div>

	{#if showCode && pluginDisplay.codeVisible}
		<CodeBlock
			code={prettyCode}
			language="json"
			filename={(spec?.title ?? 'plot').toString().toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.plot.json'}
		/>
	{/if}
{/if}

<style>
	[data-plot-plugin] {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 12px;
		border: 1px solid var(--paper-edge);
		border-radius: 8px;
		background: var(--paper);
	}

	[data-plot-footer] {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		flex-wrap: wrap;
		padding-top: 8px;
		border-top: 1px dashed var(--paper-edge);
	}

	[data-plot-summary] {
		display: inline-flex;
		align-items: baseline;
		flex-wrap: wrap;
		gap: 4px;
		font: 500 11px var(--font-mono);
		color: var(--ink-mute);
		letter-spacing: 0.04em;
	}

	[data-plot-summary-label] {
		color: var(--ink-mute);
	}

	[data-plot-summary-value] {
		color: var(--ink);
	}

	[data-plot-summary] [data-sep] {
		opacity: 0.45;
		margin: 0 2px;
	}

	[data-plot-actions] {
		display: inline-flex;
		align-items: center;
		gap: 2px;
	}

	[data-plot-action] {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		height: 24px;
		padding: 0 8px;
		border: 0;
		border-radius: 4px;
		background: transparent;
		color: var(--ink-mute);
		font: 500 11.5px var(--font-ui);
		cursor: pointer;
	}

	[data-plot-action]:hover {
		background: var(--paper-mute);
		color: var(--ink);
	}

	[data-plot-action] > span:first-child {
		width: 14px;
		height: 14px;
	}
</style>
