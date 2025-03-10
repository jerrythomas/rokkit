<script>
	import { createEmitter } from '@rokkit/core'
	import { defaultMapping } from './constants'
	import { navigator } from '@rokkit/actions'
	import { DataWrapper } from '@rokkit/states'
	import NestedList from './NestedList.svelte'

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {Array<Object>} [items]
	 * @property {import('@rokkit/core').FieldMapping} [fields]
	 * @property {any} [using]
	 * @property {string} [root]
	 * @property {any} [value]
	 */

	/** @type {Props & { [key: string]: any }} */
	let {
		class: classes = '',
		items = $bindable([]),
		mapping = defaultMapping,
		value = $bindable(null),
		icons = {},
		...events
	} = $props()

	let indices = $state([])
	let emitter = createEmitter(events, ['select', 'move', 'collapse', 'expand'])
	let wrapper = new DataWrapper(items, mapping, value, { events: emitter })
	function handle(event) {
		if (['select', 'move'].includes(event.type)) {
			value = event.detail.node
			indices = event.detail.path
		}
		if (['collapse', 'expand'].includes(event.type)) {
			items = items
		}
		emitter[event.type](value)
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<rk-tree
	onselect={handle}
	onmove={handle}
	onexpand={handle}
	oncollapse={handle}
	tabindex="0"
	class={classes}
	use:navigator={{ wrapper }}
>
	<NestedList {items} {mapping} bind:value {icons} />
</rk-tree>
