<script>
	import { defaultFields } from '@rokkit/core'

	export let value
	export let fields = defaultFields

	$: isObject = value && typeof value == 'object'
	$: text = isObject ? value[fields.text] : value
</script>

{#if isObject}
	{#if text}
		<p class="w-full flex">{text}</p>
	{/if}
{/if}
