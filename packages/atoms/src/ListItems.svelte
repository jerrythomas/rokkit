<script>
	import { equals } from 'ramda'
	import { noop, FieldMapper } from '@rokkit/core'

	/**
	 * @typedef {Object} Props
	 * @property {Array<Object>} items
	 * @property {any}           value
	 * @property {FieldMapper}   mapping
	 * @property {Function}      onchange
	 */

	/** @type {Props & { [key: string]: any }} */
	let {
		class: classes = '',
		items = $bindable([]),
		value = $bindable(),
		mapping = new FieldMapper(),
		hierarchy = [],
		onchange = noop,
		...rest
	} = $props()
</script>

{#each items as item, index}
	{@const Template = mapping.getComponent(item)}
	{@const path = [...hierarchy, index].join(',')}
	{@const props = mapping.getAttribute(item, 'props') || {}}
	<rk-list-item role="option" aria-selected={equals(value, item)} data-path={path}>
		<Template value={item} {mapping} {onchange} {...props} />
	</rk-list-item>
{/each}
