<script>
	import { Icon } from '@sparsh-ui/icons'
	export let content
	export let fields

	$: text = typeof content == 'string' ? content : content[fields.text]
</script>

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
<p class="flex flex-grow">{text}</p>
