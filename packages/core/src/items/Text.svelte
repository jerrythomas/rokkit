<script>
	import { defaultFields } from '../constants'

	export let content
	export let fields = defaultFields

	$: isString = typeof content == 'string'
	$: text = isString ? content : content[fields.text]
</script>

{#if !isString && content[fields.image]}
	<img
		class="h-8 w-8 rounded-full"
		alt={content[fields.text]}
		src={content[fields.image]}
	/>
{/if}
{#if !isString && content[fields.icon]}
	<icon class={content[fields.icon]} />
{/if}
<p class="flex flex-grow">{text}</p>
