<script>
	import { getText } from '@rokkit/core'

	export let items
	export let value
	export let fields
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
