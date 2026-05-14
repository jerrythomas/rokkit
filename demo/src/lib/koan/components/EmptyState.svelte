<script lang="ts">
	import type { Snippet } from 'svelte'

	let {
		icon = '',
		title = '',
		description = '',
		action,
		annotation
	}: {
		icon?: string
		title?: string
		description?: string
		action?: Snippet
		annotation?: Snippet
	} = $props()
</script>

<div class="empty-state">
	{#if icon}
		<div class="icon">{icon}</div>
	{/if}
	{#if title}
		<h2 class="title">{title}</h2>
	{/if}
	{#if description}
		<p class="description">{description}</p>
	{/if}
	{#if action}
		<div class="action">{@render action()}</div>
	{/if}
	{#if annotation}
		<div class="annotation">{@render annotation()}</div>
	{/if}
</div>

<style>
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		padding: 48px 24px;
		text-align: center;
	}
	.icon {
		font-size: 96px;
		line-height: 1;
		color: var(--color-ink-z1);
	}
	.title {
		margin: 0;
		font-size: 24px;
		color: var(--color-ink-z1);
	}
	.description {
		margin: 0;
		max-width: 480px;
		color: var(--color-ink-z3);
		font-family: var(--font-script, 'Caveat', cursive);
		font-size: 22px;
		line-height: 1.4;
	}
	.action {
		margin-top: 16px;
	}
	.annotation {
		margin-top: 24px;
	}
</style>
