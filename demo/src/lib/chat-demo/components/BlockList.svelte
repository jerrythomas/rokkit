<script lang="ts">
	import type { Block, SuggestionItem } from '../types'
	import { CodeBlock, MarkdownRenderer } from '@rokkit/ui'
	import {
		PlotPlugin,
		TablePlugin,
		FormPlugin,
		ListPlugin,
		StepperPlugin,
		SparklinePlugin,
		MermaidPlugin
	} from '@rokkit/blocks'
	import InlineComponent from './InlineComponent.svelte'
	import { submitAction, submitText } from '../store.svelte'

	const PLUGINS = [
		PlotPlugin,
		TablePlugin,
		FormPlugin,
		ListPlugin,
		StepperPlugin,
		SparklinePlugin,
		MermaidPlugin
	]

	let root = $state<HTMLElement | null>(null)

	function handleBlockAction(e: Event) {
		const ev = e as CustomEvent<{ name: string; payload: unknown }>
		if (!ev.detail) return
		// Forward human-in-the-loop submissions back into the conversation
		// as a structured user message. The LLM/router picks up the JSON and
		// continues from there.
		const summary = `[${ev.detail.name}] ${JSON.stringify(ev.detail.payload)}`
		submitText(summary)
	}

	$effect(() => {
		if (!root) return
		root.addEventListener('block-action', handleBlockAction)
		return () => root?.removeEventListener('block-action', handleBlockAction)
	})

	type Props = {
		blocks: Block[]
		onSuggestion?: (query: string) => void
	}

	const { blocks, onSuggestion }: Props = $props()

	// Plugin blocks (chart / table / form / …) own their own "view code"
	// affordance — driven globally by @rokkit/blocks' pluginDisplay store.
	// Standalone `kind: 'code'` blocks (filename + body) are rare here and
	// always render; keep them visible.
	const visibleBlocks = $derived(blocks)

	function handleSuggestion(item: SuggestionItem) {
		// Data-aware action takes precedence; the text query is a fallback for
		// when there's no action (or for the future LLM path).
		if (item.action) {
			submitAction({ label: item.label, action: item.action })
			return
		}
		onSuggestion?.(item.query)
	}
</script>

<div data-block-list bind:this={root}>
	{#each visibleBlocks as block, i (i)}
		{#if block.kind === 'prose'}
			<p data-block data-block-kind="prose">{block.text}</p>
		{:else if block.kind === 'markdown'}
			<div data-block data-block-kind="markdown">
				<MarkdownRenderer markdown={block.markdown} plugins={PLUGINS} />
			</div>
		{:else if block.kind === 'code'}
			<CodeBlock
				filename={block.filename ?? 'snippet'}
				language={block.language}
				code={block.code}
			/>
		{:else if block.kind === 'component'}
			<InlineComponent tool={block.tool} props={block.props} caption={block.caption} />
		{:else if block.kind === 'error'}
			<div data-block data-block-kind="error">
				<div data-block-error-head>
					<span class="i-mdi:alert-circle-outline" aria-hidden="true"></span>
					<span data-block-error-title>{block.title}</span>
				</div>
				<p data-block-error-message>{block.message}</p>
				{#if block.details}
					<details data-block-error-details>
						<summary>show full details</summary>
						<pre>{block.details}</pre>
					</details>
				{/if}
				{#if block.hint}
					<p data-block-error-hint>{block.hint}</p>
				{/if}
			</div>
		{:else if block.kind === 'data-note'}
			<div data-block data-block-kind="data-note">
				<span data-block-datanote-tag>{block.source.toUpperCase()}</span>
				<span data-block-datanote-shape>{block.shape}</span>
				{#if block.rowCount !== undefined && block.rowCount !== null}
					<span data-block-datanote-sep>·</span>
					<span>{block.rowCount} rows</span>
				{/if}
				{#if block.columns}
					<span data-block-datanote-sep>·</span>
					<div data-block-datanote-cols>
						{#each block.columns as col (col.name)}
							<span data-block-datanote-col>
								<code>{col.name}</code><span data-block-datanote-type>{col.type}</span>
							</span>
						{/each}
					</div>
				{/if}
			</div>
		{:else if block.kind === 'suggestions'}
			<div data-block data-block-kind="suggestions">
				{#if block.intro}<span data-block-suggestions-intro>{block.intro}</span>{/if}
				<div data-block-suggestions-row>
					{#each block.items as item (item.query)}
						<button type="button" data-block-suggestion onclick={() => handleSuggestion(item)}>
							{item.label}
						</button>
					{/each}
				</div>
			</div>
		{/if}
	{/each}
</div>

<style>
	[data-block-list] {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	[data-block-kind='prose'] {
		margin: 0;
		font: 400 14px/1.6 var(--font-ui);
		color: var(--ink);
	}

	[data-block-kind='prose'] :global(code) {
		font: 12.5px var(--font-mono);
		padding: 1px 5px;
		background: var(--paper-soft);
		border-radius: 4px;
	}

	/* LLM markdown path: kill default browser margins on paragraphs / headings
	 * so the gap before an inline plugin (chart / table / form) matches the
	 * scripted prose block. Plugin blocks (data-plot-plugin etc.) stay flush. */
	[data-block-kind='markdown'] :global(p),
	[data-block-kind='markdown'] :global(h1),
	[data-block-kind='markdown'] :global(h2),
	[data-block-kind='markdown'] :global(h3),
	[data-block-kind='markdown'] :global(h4),
	[data-block-kind='markdown'] :global(ul),
	[data-block-kind='markdown'] :global(ol) {
		margin: 0;
	}

	[data-block-kind='markdown'] :global(p + *),
	[data-block-kind='markdown'] :global(ul + *),
	[data-block-kind='markdown'] :global(ol + *) {
		margin-top: 8px;
	}

	[data-block-kind='markdown'] :global([data-plot-plugin]),
	[data-block-kind='markdown'] :global([data-table-plugin]),
	[data-block-kind='markdown'] :global([data-form-plugin]),
	[data-block-kind='markdown'] :global([data-list-plugin]),
	[data-block-kind='markdown'] :global([data-stepper-plugin]),
	[data-block-kind='markdown'] :global([data-sparkline-plugin]) {
		margin-top: 8px;
	}

	[data-block-kind='markdown'] :global(code) {
		font: 12.5px var(--font-mono);
		padding: 1px 5px;
		background: var(--paper-soft);
		border-radius: 4px;
	}

	[data-block-kind='suggestions'] {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
		margin-top: 4px;
	}

	[data-block-suggestions-intro] {
		font: 500 11px var(--font-mono);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-mute);
	}

	[data-block-suggestions-row] {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	[data-block-suggestion] {
		display: inline-flex;
		align-items: center;
		height: 26px;
		padding: 0 11px;
		border: 1px dashed var(--paper-edge);
		border-radius: 9999px;
		background: var(--paper);
		font: 500 12px var(--font-ui);
		color: var(--ink-mute);
		cursor: pointer;
	}

	[data-block-suggestion]:hover {
		border-color: var(--accent);
		color: var(--accent);
		border-style: solid;
		background: color-mix(in oklab, var(--accent) 6%, var(--paper-soft));
	}

	[data-block-kind='error'] {
		padding: 12px 14px;
		border: 1px solid color-mix(in oklab, var(--danger, #c43838) 45%, transparent);
		background: color-mix(in oklab, var(--danger, #c43838) 6%, var(--paper));
		border-radius: 8px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	[data-block-error-head] {
		display: flex;
		align-items: center;
		gap: 8px;
		font: 600 13px var(--font-ui);
		color: var(--danger, #c43838);
	}

	[data-block-error-title] {
		line-height: 1.3;
	}

	[data-block-error-message] {
		margin: 0;
		font: 400 13.5px/1.55 var(--font-ui);
		color: var(--ink);
		overflow-wrap: anywhere;
		white-space: pre-wrap;
	}

	[data-block-error-hint] {
		margin: 0;
		font: 400 12.5px/1.5 var(--font-ui);
		color: var(--ink-mute);
		padding-top: 6px;
		border-top: 1px dashed color-mix(in oklab, var(--danger, #c43838) 25%, transparent);
	}

	[data-block-error-details] summary {
		font: 500 11.5px var(--font-mono);
		color: var(--ink-mute);
		cursor: pointer;
		letter-spacing: 0.04em;
	}

	[data-block-error-details] pre {
		margin: 6px 0 0;
		padding: 8px 10px;
		max-height: 200px;
		overflow: auto;
		background: var(--paper-soft);
		border-radius: 4px;
		font: 11.5px/1.5 var(--font-mono);
		color: var(--ink-soft);
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}

	[data-block-kind='data-note'] {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px;
		padding: 8px 10px;
		background: var(--paper-soft);
		border: 1px dashed var(--paper-edge);
		border-radius: 6px;
		font: 500 11.5px var(--font-mono);
		color: var(--ink-mute);
	}

	[data-block-datanote-tag] {
		padding: 2px 6px;
		background: color-mix(in oklab, var(--accent) 16%, var(--paper-soft));
		color: var(--accent);
		border-radius: 4px;
		font-size: 10.5px;
		letter-spacing: 0.06em;
	}

	[data-block-datanote-shape] {
		text-transform: capitalize;
		color: var(--ink);
	}

	[data-block-datanote-sep] {
		opacity: 0.5;
	}

	[data-block-datanote-cols] {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}

	[data-block-datanote-col] {
		display: inline-flex;
		align-items: baseline;
		gap: 4px;
	}

	[data-block-datanote-col] code {
		font: 500 11px var(--font-mono);
		color: var(--ink);
		background: transparent;
		padding: 0;
	}

	[data-block-datanote-type] {
		font-size: 10px;
		color: var(--ink-mute);
		font-weight: 400;
	}
</style>
