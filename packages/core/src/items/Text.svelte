<script>
	import { defaultFields } from '../constants'

	export let content
	export let fields = defaultFields

	$: isObject = typeof content == 'object'
	$: text = isObject ? content[fields.text] : content
</script>

{#if isObject && content[fields.image]}
	<img
		class="h-8 w-8 rounded-full"
		alt={content[fields.text]}
		src={content[fields.image]}
	/>
{/if}
{#if isObject && content[fields.icon]}
	<icon class={content[fields.icon]} />
{/if}
<p class="flex flex-grow">{text}</p>
