<script>
	import { identity } from 'ramda'
	import { defaultFields, getIcon, isObject, getFormattedText } from '@rokkit/core'
	import { Icon } from '@rokkit/atoms'

	/**
	 * @typedef {Object} Props
	 * @property {any} value
	 * @property {any} [fields]
	 * @property {any} [formatter]
	 */

	/** @type {Props} */
	let { value = $bindable(), fields = defaultFields, formatter = null } = $props()

	// $: isObject = typeof (value ?? '-') === 'object'
	let text = $derived(getFormattedText(value, fields, formatter))
</script>

{#if isObject(value)}
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
