<script>
	import { createEmitter } from '@rokkit/core'
	import { navigator } from '@rokkit/actions'
	import { DataWrapper } from '@rokkit/states'
	import { defaultMapping } from './constants'
	import NestedList from './NestedList.svelte'

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {Array<Object>} [items]
	 * @property {import('@rokkit/core').FieldMapping} [mapping]
	 * @property {any} [value]
	 * @property {import('./types').NodeStateIcons} icons
	 * @property {boolean} [autoCloseSiblings=false]
	 * @property {boolean} [multiselect=false]
	 */

	/** @type {Props & { [key: string]: any }} */
	let {
		class: classes = '',
		items = $bindable([]),
		mapping = defaultMapping,
		value = $bindable(null),
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
	<NestedList {items} {mapping} bind:value {icons} />
</rk-tree>
