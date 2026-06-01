<script lang="ts">
	import type { Snippet } from 'svelte'
	import PreviewCard from './PreviewCard.svelte'

	type Item = { id: string; icon: string; title: string; description: string }

	let {
		items = [] as Item[],
		breadcrumb = '',
		onpick,
		card
	}: {
		items?: Item[]
		breadcrumb?: string
		onpick?: (item: Item) => void
		card?: Snippet<[Item]>
	} = $props()
</script>

<div class="gallery">
	{#if breadcrumb}
		<p class="breadcrumb" aria-hidden="true">{breadcrumb}</p>
	{/if}
	<div class="grid">
		{#each items as item (item.id)}
			{#if card}
				{@render card(item)}
			{:else}
				<PreviewCard
					icon={item.icon}
					title={item.title}
					description={item.description}
					onclick={() => onpick?.(item)}
				/>
			{/if}
		{/each}
	</div>
</div>

<style>
	.gallery {
		display: flex;
		flex-direction: column;
		gap: 24px;
		max-width: 1080px;
		margin: 0 auto;
	}
	.breadcrumb {
		margin: 0;
		font-family: var(--font-script, 'Caveat', cursive);
		font-size: 22px;
		@apply text-ink-z3;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 16px;
	}
</style>
