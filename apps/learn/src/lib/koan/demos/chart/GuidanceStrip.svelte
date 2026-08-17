<script lang="ts">
	import { explorer } from './store.svelte'
	// Show up to three leading nudges for the active chart type.
	const tips = $derived(explorer.tips.slice(0, 3))
</script>

{#if tips.length}
	<div class="guidance" data-plot-guidance>
		<span class="hint" aria-hidden="true">💡</span>
		<div class="tips">
			{#each tips as tip (tip.text)}
				<button
					type="button"
					class="tip"
					data-plot-guidance-tip
					onclick={() => explorer.apply(tip)}
				>
					{tip.text}
					{#if tip.to || tip.set}<span class="arrow" aria-hidden="true">→</span>{/if}
				</button>
			{/each}
		</div>
	</div>
{/if}

<style>
	.guidance {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.55rem 0.7rem;
		background: var(--color-primary-soft, rgba(59, 130, 246, 0.08));
		border: 1px solid var(--color-paper-edge, #e5e5e5);
		border-radius: 0.6rem;
	}
	.hint {
		font-size: 1rem;
	}
	.tips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}
	.tip {
		border: 1px solid var(--color-paper-edge, #ddd);
		background: var(--color-paper, #fff);
		color: var(--color-ink, #333);
		border-radius: 999px;
		padding: 0.25rem 0.7rem;
		font-size: 0.78rem;
		cursor: pointer;
	}
	.tip:hover {
		border-color: var(--color-primary, #3b82f6);
		color: var(--color-primary, #3b82f6);
	}
	.arrow {
		margin-left: 0.3rem;
		opacity: 0.7;
	}
</style>
