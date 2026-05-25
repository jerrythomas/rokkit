<script lang="ts">
	import { goto } from '$app/navigation'
	import { findById } from '$lib/koan/catalog'
	import type { ShellDemoType } from '$lib/koan/shell.svelte'

	type Props = {
		demoId: ShellDemoType
		basePath: string
		activeId: string | null
		intro?: string
	}

	let { demoId, basePath, activeId, intro = 'Try variants:' }: Props = $props()

	const variants = $derived(findById(demoId)?.variants ?? [])

	function chipHref(variantId: string): string {
		return activeId === variantId ? basePath : `${basePath}?variant=${variantId}`
	}
</script>

{#if variants.length > 0}
	<span class="variant-row">
		<span class="variant-intro">{intro}</span>
		{#each variants as v (v.id)}
			<button
				type="button"
				class="variant-chip"
				data-active={activeId === v.id ? '' : undefined}
				onclick={() => goto(chipHref(v.id))}
			>
				{v.label}{#if activeId === v.id} · clear{/if}
			</button>
		{/each}
	</span>
{/if}

<style>
	.variant-row {
		display: inline-flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px;
		margin-top: 6px;
	}

	.variant-intro {
		font: 500 12px var(--font-ui);
		color: var(--ink-mute);
		margin-right: 2px;
	}

	.variant-chip {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		height: 24px;
		padding: 0 10px;
		border: 1px solid var(--paper-edge);
		border-radius: 9999px;
		background: var(--paper-soft);
		color: var(--ink-mute);
		font: 500 11.5px var(--font-ui);
		cursor: pointer;
	}

	.variant-chip:hover {
		border-color: var(--ink-soft);
		color: var(--ink);
	}

	.variant-chip[data-active] {
		border-color: var(--accent);
		color: var(--accent);
		background: color-mix(in oklab, var(--accent) 6%, var(--paper-soft));
	}
</style>
