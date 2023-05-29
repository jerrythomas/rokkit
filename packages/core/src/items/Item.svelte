<script>
	import { defaultFields } from '../constants'
	import Icon from '../Icon.svelte'

	export let value
	export let fields = defaultFields

	$: isObject = typeof value == 'object'
	$: text = isObject ? value[fields.text] : value
</script>

{#if isObject}
	{#if value[fields.icon]}
		{@const iconName =
			typeof value[fields.icon] == 'object'
				? value[fields.icon][value[fields.state]]
				: value[fields.icon]}
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
