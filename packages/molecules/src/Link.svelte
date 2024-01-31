<script>
	import { defaultFields, getAttribute, getIcon, getText } from '@rokkit/core'
	import { Icon } from '@rokkit/atoms'

	/** @type {*} */
	export let value
	export let fields = defaultFields

	$: isObject = typeof (value ?? '-') == 'object'
	$: text = getText(value, fields)
	$: href = getAttribute(value, fields.href)
	$: target = getAttribute(value, fields.target)
</script>

<a {href} {target} >
	{#if isObject}
		{#if value[fields.icon]}
			{@const iconName = getIcon(value, fields)}
			<Icon name={iconName} />
		{:else if value[fields.image]}
			<img class="min-h-4 min-w-4 object-cover" alt={text} src={value[fields.image]} />
		{/if}
	{/if}
	{#if text}
		<p>{text}</p>
	{/if}
</a>
