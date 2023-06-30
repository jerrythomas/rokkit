<script>
	import { defaultFields, getIcon } from 'rokkit/utils'
	import { Icon } from 'rokkit/atoms'

	export let value
	export let fields = defaultFields

	$: isObject = typeof (value ?? '-') == 'object'
	$: text = isObject ? value[fields.text] : value
</script>

{#if isObject}
	{#if value[fields.icon]}
		{@const iconName = getIcon(value, fields)}
		<Icon name={iconName} />
	{:else if value[fields.image]}
		<img
			class="h-4 w-4 object-cover"
			alt={value[fields.text]}
			src={value[fields.image]}
		/>
	{/if}
{/if}
{#if text}
	<p class="w-full flex">{text}</p>
{/if}
