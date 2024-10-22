<script>
	import { run } from 'svelte/legacy';

	import { createEventDispatcher } from 'svelte'
	import { defaultFields } from '@rokkit/core'
	import { navigator } from '@rokkit/actions'
	import { Item } from '@rokkit/molecules'
	import { addRootNode } from './lib'
	import NestedList from './NestedList.svelte'

	const dispatch = createEventDispatcher()
	
	
	
	
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
		class: className = '',
		items = $bindable([]),
		fields = $bindable({}),
		using = { default: Item },
		root = null,
		value = $bindable(null),
		...rest
	} = $props();

	let indices = $state([])

	function handle(event) {
		if (['select', 'move'].includes(event.type)) {
			value = event.detail.node
			indices = event.detail.path
		}
		if (['collapse', 'expand'].includes(event.type)) {
			items = items
		}
		dispatch(event.type, value)
	}

	run(() => {
		fields = { ...defaultFields, ...fields }
	});
	run(() => {
		items = addRootNode(items, root, fields)
	});
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<tree
	use:navigator={{ items, fields, indices }}
	onselect={handle}
	onmove={handle}
	onexpand={handle}
	oncollapse={handle}
	tabindex="0"
	class={className}
>
	<NestedList {items} {fields} {using} bind:value {...rest} />
</tree>
