<script lang="ts">
	import type { Block } from '../types'
	import { CodeBlock } from '$lib/chat'
	import InlineComponent from './InlineComponent.svelte'

	type Props = {
		blocks: Block[]
		onSuggestion?: (query: string) => void
	}

	const { blocks, onSuggestion }: Props = $props()
</script>

<div class="block-list">
	{#each blocks as block, i (i)}
		{#if block.kind === 'prose'}
			<p class="block-prose">{block.text}</p>
		{:else if block.kind === 'code'}
			<CodeBlock
				filename={block.filename ?? 'snippet'}
				language={block.language}
				code={block.code}
			/>
		{:else if block.kind === 'component'}
			<InlineComponent tool={block.tool} props={block.props} caption={block.caption} />
		{:else if block.kind === 'suggestions'}
			<div class="block-suggestions">
				{#if block.intro}<span class="block-suggestions-intro">{block.intro}</span>{/if}
				<div class="block-suggestions-row">
					{#each block.items as item (item.query)}
						<button type="button" class="block-suggestion" onclick={() => onSuggestion?.(item.query)}>
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
		gap: 12px;
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
</style>
