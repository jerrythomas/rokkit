<script>
	import { Icon } from '@sparsh-ui/icons'
	export let content
	export let fields
</script>

<a
	class="px-3 flex flex-row flex-grow gap-2 content"
	href={content[fields.url]}
>
	{#if content[fields.image]}
		<img
			class="h-8 w-8 rounded-full"
			alt={content[fields.text]}
			src={content[fields.image]}
		/>
	{/if}
	{#if content[fields.icon]}
		<Icon name={content[fields.icon]} title={content[fields.text]} />
	{/if}
	{content[fields.text]}
</a>
