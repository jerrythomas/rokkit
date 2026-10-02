<script lang="ts">
	/*
	 * The demo on screen. `renderPlan` decides how it is drawn: the inline table/list/form,
	 * a plot, the demo's own live component (the one /app mounts), or a card to its page.
	 */
	import type { Component } from 'svelte'
	import { MarkdownRenderer } from '@rokkit/ui'
	import { BLOCK_PLUGINS } from '$lib/koan/block-plugins'
	import type { DemoBlock } from '../types'
	import { renderPlan } from '../intent/render-plan'
	import { demoById, hrefOf, variantOf } from '../intent/demos'
	import InlineComponent from './InlineComponent.svelte'

	const { block }: { block: DemoBlock } = $props()

	const plan = $derived(renderPlan(block))
	const meta = $derived(demoById(block.demo))
	const title = $derived(meta?.title ?? block.demo)
	const variantLabel = $derived(variantOf(block.demo, block.variant)?.label)
	const live = $derived<Promise<{ default: Component }> | null>(plan.kind === 'live' && meta ? meta.load() : null)
	const plot = $derived(plan.kind === 'plot' ? `\`\`\`plot\n${JSON.stringify(plan.spec)}\n\`\`\`` : '')
</script>

<figure data-block data-block-kind="demo" data-demo={block.demo} data-variant={block.variant}>
	{#if plan.kind === 'inline'}
		<InlineComponent tool={plan.tool} props={plan.props} />
	{:else if plan.kind === 'plot'}
		<MarkdownRenderer markdown={plot} plugins={BLOCK_PLUGINS} />
	{:else if plan.kind === 'live' && live}
		{#await live}
			<div data-demo-loading><span class="koan-spinner" aria-hidden="true"></span></div>
		{:then mod}
			{@const Live = mod.default}
			<div data-demo-live><Live {...plan.props} /></div>
		{:catch err}
			<p data-demo-error>Could not load the {title} demo: {err.message}</p>
		{/await}
	{:else}
		<div data-demo-card>
			<span data-demo-card-icon aria-hidden="true">{meta?.icon}</span>
			<p>{meta?.description}</p>
		</div>
	{/if}
	<figcaption data-demo-caption>
		<span>{title}{#if variantLabel} · {variantLabel}{/if}</span>
		<a href={hrefOf(block.demo)} data-demo-open>Open the full demo</a>
	</figcaption>
</figure>

<style>
	[data-block-kind='demo'] {
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	[data-demo-live] {
		padding: 12px;
		border: 1px solid var(--paper-edge);
		border-radius: 8px;
		background: var(--paper-soft);
		overflow: auto;
	}

	[data-demo-loading] {
		display: grid;
		place-items: center;
		min-height: 80px;
	}

	[data-demo-card] {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px;
		border: 1px solid var(--paper-edge);
		border-radius: 8px;
		background: var(--paper-soft);
		font: 400 13px/1.5 var(--font-ui);
		color: var(--ink);
	}

	[data-demo-card] p {
		margin: 0;
	}

	[data-demo-card-icon] {
		font-size: 22px;
	}

	[data-demo-caption] {
		display: flex;
		justify-content: space-between;
		gap: 8px;
		font: 500 11.5px var(--font-ui);
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--ink-mute);
	}

	[data-demo-open] {
		color: var(--ink-mute);
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	[data-demo-open]:hover {
		color: var(--ink);
	}

	[data-demo-error] {
		font: 13px var(--font-ui);
		color: var(--ink-mute);
	}
</style>
