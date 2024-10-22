<script>
	import { getText } from '@rokkit/core'

	let { items, value, fields } = $props();
</script>

<carousel>
	{#each items as item}
		{@const text = getText(item, fields)}
		{@const image = item[fields.image]}
		<carousel-item>
			{#if image}
				<img src={image} alt={text} />
			{:else}
				<p>{text}</p>
			{/if}
		</carousel-item>
	{/each}
</carousel>
