<script>
	import { getText } from '@rokkit/core'
	import { get } from 'svelte/store'

	export let items
	export let value
	export let fields
</script>

<carousel>
	{#each items as item}
		{@const text = getText(item, fields)}
		{@const image = item[fields.image]}
		<carousel-item {item} />
	{/each}
</carousel>
