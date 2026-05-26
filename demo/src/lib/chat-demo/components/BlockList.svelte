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

<div class="block-list" bind:this={root}>
	{#each visibleBlocks as block, i (i)}
		{#if block.kind === 'prose'}
			<p class="block-prose">{block.text}</p>
		{:else if block.kind === 'markdown'}
			<div class="block-markdown">
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
			<div class="block-error">
				<div class="block-error-head">
					<span class="i-mdi:alert-circle-outline" aria-hidden="true"></span>
					<span class="block-error-title">{block.title}</span>
				</div>
				<p class="block-error-message">{block.message}</p>
				{#if block.details}
					<details class="block-error-details">
						<summary>show full details</summary>
						<pre>{block.details}</pre>
					</details>
				{/if}
				{#if block.hint}
					<p class="block-error-hint">{block.hint}</p>
				{/if}
			</div>
		{:else if block.kind === 'data-note'}
			<div class="block-datanote">
				<span class="block-datanote-tag">{block.source.toUpperCase()}</span>
				<span class="block-datanote-shape">{block.shape}</span>
				{#if block.rowCount !== undefined && block.rowCount !== null}
					<span class="block-datanote-sep">·</span>
					<span>{block.rowCount} rows</span>
				{/if}
				{#if block.columns}
					<span class="block-datanote-sep">·</span>
					<div class="block-datanote-cols">
						{#each block.columns as col (col.name)}
							<span class="block-datanote-col">
								<code>{col.name}</code><span class="block-datanote-type">{col.type}</span>
							</span>
						{/each}
					</div>
				{/if}
			</div>
		{:else if block.kind === 'suggestions'}
			<div class="block-suggestions">
				{#if block.intro}<span class="block-suggestions-intro">{block.intro}</span>{/if}
				<div class="block-suggestions-row">
					{#each block.items as item (item.query)}
						<button type="button" class="block-suggestion" onclick={() => handleSuggestion(item)}>
							{item.label}
						</button>
					{/each}
				</div>
			</div>
		{/if}
	{/each}
</div>

<style>
	.block-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.block-prose {
		margin: 0;
		font: 400 14px/1.6 var(--font-ui);
		color: var(--ink);
	}

	.block-prose :global(code) {
		font: 12.5px var(--font-mono);
		padding: 1px 5px;
		background: var(--paper-soft);
		border-radius: 4px;
	}

	.block-suggestions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
		margin-top: 4px;
	}

	.block-suggestions-intro {
		font: 500 11px var(--font-mono);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-mute);
	}

	.block-suggestions-row {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.block-suggestion {
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

	.block-suggestion:hover {
		border-color: var(--accent);
		color: var(--accent);
		border-style: solid;
		background: color-mix(in oklab, var(--accent) 6%, var(--paper-soft));
	}

	.block-error {
		padding: 12px 14px;
		border: 1px solid color-mix(in oklab, var(--danger, #c43838) 45%, transparent);
		background: color-mix(in oklab, var(--danger, #c43838) 6%, var(--paper));
		border-radius: 8px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.block-error-head {
		display: flex;
		align-items: center;
		gap: 8px;
		font: 600 13px var(--font-ui);
		color: var(--danger, #c43838);
	}

	.block-error-title {
		line-height: 1.3;
	}

	.block-error-message {
		margin: 0;
		font: 400 13.5px/1.55 var(--font-ui);
		color: var(--ink);
		overflow-wrap: anywhere;
		white-space: pre-wrap;
	}

	.block-error-hint {
		margin: 0;
		font: 400 12.5px/1.5 var(--font-ui);
		color: var(--ink-mute);
		padding-top: 6px;
		border-top: 1px dashed color-mix(in oklab, var(--danger, #c43838) 25%, transparent);
	}

	.block-error-details summary {
		font: 500 11.5px var(--font-mono);
		color: var(--ink-mute);
		cursor: pointer;
		letter-spacing: 0.04em;
	}

	.block-error-details pre {
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

	.block-datanote {
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

	.block-datanote-tag {
		padding: 2px 6px;
		background: color-mix(in oklab, var(--accent) 16%, var(--paper-soft));
		color: var(--accent);
		border-radius: 4px;
		font-size: 10.5px;
		letter-spacing: 0.06em;
	}

	.block-datanote-shape {
		text-transform: capitalize;
		color: var(--ink);
	}

	.block-datanote-sep {
		opacity: 0.5;
	}

	.block-datanote-cols {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}

	.block-datanote-col {
		display: inline-flex;
		align-items: baseline;
		gap: 4px;
	}

	.block-datanote-col code {
		font: 500 11px var(--font-mono);
		color: var(--ink);
		background: transparent;
		padding: 0;
	}

	.block-datanote-type {
		font-size: 10px;
		color: var(--ink-mute);
		font-weight: 400;
	}
</style>
