<script lang="ts">
	import type { Block, SuggestionItem } from '../types'
	import { CodeBlock } from '$lib/chat'
	import { MarkdownRenderer } from '@rokkit/ui'
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
	import { llm } from '../llm.svelte'

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

	// Code blocks are filtered at render time, not in the LLM/parser layer.
	// The LLM emits whatever it considers useful; the user controls visibility
	// via the llm.showCode toggle. The component blocks (charts, tables,
	// forms) ARE the canonical rendering — code is a supplemental view.
	const visibleBlocks = $derived(
		blocks.filter((b) => b.kind !== 'code' || llm.showCode)
	)

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

<div class="msg-list" bind:this={root}>
	{#each visibleBlocks as block, i (i)}
		{#if block.kind === 'prose'}
			<p class="msg-prose">{block.text}</p>
		{:else if block.kind === 'markdown'}
			<div class="msg-markdown">
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
			<div class="msg-error">
				<div class="msg-error-head">
					<span class="i-mdi:alert-circle-outline" aria-hidden="true"></span>
					<span class="msg-error-title">{block.title}</span>
				</div>
				<p class="msg-error-message">{block.message}</p>
				{#if block.details}
					<details class="msg-error-details">
						<summary>show full details</summary>
						<pre>{block.details}</pre>
					</details>
				{/if}
				{#if block.hint}
					<p class="msg-error-hint">{block.hint}</p>
				{/if}
			</div>
		{:else if block.kind === 'data-note'}
			<div class="msg-datanote">
				<span class="msg-datanote-tag">{block.source.toUpperCase()}</span>
				<span class="msg-datanote-shape">{block.shape}</span>
				{#if block.rowCount !== undefined && block.rowCount !== null}
					<span class="msg-datanote-sep">·</span>
					<span>{block.rowCount} rows</span>
				{/if}
				{#if block.columns}
					<span class="msg-datanote-sep">·</span>
					<div class="msg-datanote-cols">
						{#each block.columns as col (col.name)}
							<span class="msg-datanote-col">
								<code>{col.name}</code><span class="msg-datanote-type">{col.type}</span>
							</span>
						{/each}
					</div>
				{/if}
			</div>
		{:else if block.kind === 'suggestions'}
			<div class="msg-suggestions">
				{#if block.intro}<span class="msg-suggestions-intro">{block.intro}</span>{/if}
				<div class="msg-suggestions-row">
					{#each block.items as item (item.query)}
						<button type="button" class="msg-suggestion" onclick={() => handleSuggestion(item)}>
							{item.label}
						</button>
					{/each}
				</div>
			</div>
		{/if}
	{/each}
</div>

<style>
	.msg-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.msg-prose {
		margin: 0;
		font: 400 14px/1.6 var(--font-ui);
		color: var(--ink);
	}

	.msg-prose :global(code) {
		font: 12.5px var(--font-mono);
		padding: 1px 5px;
		background: var(--paper-soft);
		border-radius: 4px;
	}

	/* LLM markdown path: kill default browser margins on paragraphs / headings
	 * so the gap before an inline plugin (chart / table / form) matches the
	 * scripted prose block. Plugin blocks (data-plot-plugin etc.) stay flush. */
	.msg-markdown :global(p),
	.msg-markdown :global(h1),
	.msg-markdown :global(h2),
	.msg-markdown :global(h3),
	.msg-markdown :global(h4),
	.msg-markdown :global(ul),
	.msg-markdown :global(ol) {
		margin: 0;
	}

	.msg-markdown :global(p + *),
	.msg-markdown :global(ul + *),
	.msg-markdown :global(ol + *) {
		margin-top: 8px;
	}

	.msg-markdown :global([data-plot-plugin]),
	.msg-markdown :global([data-table-plugin]),
	.msg-markdown :global([data-form-plugin]),
	.msg-markdown :global([data-list-plugin]),
	.msg-markdown :global([data-stepper-plugin]),
	.msg-markdown :global([data-sparkline-plugin]) {
		margin-top: 8px;
	}

	.msg-markdown :global(code) {
		font: 12.5px var(--font-mono);
		padding: 1px 5px;
		background: var(--paper-soft);
		border-radius: 4px;
	}

	.msg-suggestions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
		margin-top: 4px;
	}

	.msg-suggestions-intro {
		font: 500 11px var(--font-mono);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-mute);
	}

	.msg-suggestions-row {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.msg-suggestion {
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

	.msg-suggestion:hover {
		border-color: var(--accent);
		color: var(--accent);
		border-style: solid;
		background: color-mix(in oklab, var(--accent) 6%, var(--paper-soft));
	}

	.msg-error {
		padding: 12px 14px;
		border: 1px solid color-mix(in oklab, var(--danger, #c43838) 45%, transparent);
		background: color-mix(in oklab, var(--danger, #c43838) 6%, var(--paper));
		border-radius: 8px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.msg-error-head {
		display: flex;
		align-items: center;
		gap: 8px;
		font: 600 13px var(--font-ui);
		color: var(--danger, #c43838);
	}

	.msg-error-title {
		line-height: 1.3;
	}

	.msg-error-message {
		margin: 0;
		font: 400 13.5px/1.55 var(--font-ui);
		color: var(--ink);
		overflow-wrap: anywhere;
		white-space: pre-wrap;
	}

	.msg-error-hint {
		margin: 0;
		font: 400 12.5px/1.5 var(--font-ui);
		color: var(--ink-mute);
		padding-top: 6px;
		border-top: 1px dashed color-mix(in oklab, var(--danger, #c43838) 25%, transparent);
	}

	.msg-error-details summary {
		font: 500 11.5px var(--font-mono);
		color: var(--ink-mute);
		cursor: pointer;
		letter-spacing: 0.04em;
	}

	.msg-error-details pre {
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

	.msg-datanote {
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

	.msg-datanote-tag {
		padding: 2px 6px;
		background: color-mix(in oklab, var(--accent) 16%, var(--paper-soft));
		color: var(--accent);
		border-radius: 4px;
		font-size: 10.5px;
		letter-spacing: 0.06em;
	}

	.msg-datanote-shape {
		text-transform: capitalize;
		color: var(--ink);
	}

	.msg-datanote-sep {
		opacity: 0.5;
	}

	.msg-datanote-cols {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}

	.msg-datanote-col {
		display: inline-flex;
		align-items: baseline;
		gap: 4px;
	}

	.msg-datanote-col code {
		font: 500 11px var(--font-mono);
		color: var(--ink);
		background: transparent;
		padding: 0;
	}

	.msg-datanote-type {
		font-size: 10px;
		color: var(--ink-mute);
		font-weight: 400;
	}
</style>
