<script>
	import { defaultFields } from '../constants'

	export let content
	export let fields = defaultFields

	$: isObject = typeof content == 'object'
	$: text = isObject ? content[fields.text] : content
</script>

{#if isObject && content[fields.image]}
	<img
		class="h-4 w-4 object-cover"
		alt={content[fields.text]}
		src={content[fields.image]}
	/>
{/if}
{#if isObject && content[fields.icon]}
	{@const iconName =
		typeof content[fields.icon] == 'object'
			? content[fields.icon][content[fields.state]]
			: content[fields.icon]}
	<icon class={iconName} />
{/if}
<p class="flex flex-grow">{text}</p>
