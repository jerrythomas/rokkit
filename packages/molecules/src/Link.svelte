<script>
	import { defaultFields, getAttribute, getIcon, getText } from '@rokkit/core'
	import { Icon } from '@rokkit/atoms'

	
	/**
	 * @typedef {Object} Props
	 * @property {*} value
	 * @property {any} [fields]
	 */

	/** @type {Props} */
	let { value, fields = defaultFields } = $props();

	let isObject = $derived(typeof (value ?? '-') === 'object')
	let text = $derived(getText(value, fields))
	let href = $derived(getAttribute(value, fields.url))
	let target = $derived(getAttribute(value, fields.target))
</script>

<a {href} {target}>
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
