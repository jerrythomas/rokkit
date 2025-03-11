<script>
	import { createEmitter } from '@rokkit/core'
	import { navigator } from '@rokkit/actions'
	import { DataWrapper } from '@rokkit/states'
	import { defaultMapping } from './constants'
	import NestedList from './NestedList.svelte'

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {Array<any>} [items]
	 * @property {any} [value]
	 * @property {import('@rokkit/core').FieldMapping} [mapping]
	 * @property {import('./types').NodeStateIcons|Object} [icons]
	 * @property {boolean} [autoCloseSiblings=false]
	 * @property {boolean} [multiselect=false]
	 */

	/** @type {Props & { [key: string]: any }} */
	let {
		class: classes = 'h-full overflow-scroll flex flex-col',
		items = $bindable([]),
		value = $bindable(null),
		mapping = defaultMapping,
		icons = {},
		autoCloseSiblings = false,
		multiselect = false,
		...events
	} = $props()

	let emitter = createEmitter(events, ['select', 'move', 'collapse', 'expand'])
	let wrapper = new DataWrapper(items, mapping, value, {
		events: emitter,
		multiselect,
		autoCloseSiblings
	})
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<rk-tree
	tabindex="0"
	class={classes}
	use:navigator={{ wrapper }}
	onactivate={() => (value = wrapper.value)}
>
	<NestedList bind:items={wrapper.data} {wrapper} {mapping} {value} {icons} />
</rk-tree>
