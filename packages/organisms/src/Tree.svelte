<script>
	import { createEventDispatcher } from 'svelte'
	import { defaultFields } from '@rokkit/core'
	import { navigator } from '@rokkit/actions'
	import { Item } from '@rokkit/molecules'
	import { addRootNode } from './lib'
	import NestedList from './NestedList.svelte'

	const dispatch = createEventDispatcher()
	let className = ''
	export { className as class }
	/** @type {Array<Object>} */
	export let items = []
	/** @type {import('@rokkit/core').FieldMapping} */
	export let fields = {}
	export let using = { default: Item }
	/** @type {string} */
	export let root = null
	export let value = null

	let indices = []

	function handle(event) {
		if (['select','move'].includes(event.type) ) {
			value = event.detail.node
		  indices = event.detail.path
		}
		if (['collapse', 'expand'].includes(event.type)) {
			items = items
		}
		dispatch(event.type, value)
	}

	$: fields = { ...defaultFields, ...fields }
	$: items = addRootNode(items, root, fields)
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<tree
	use:navigator={{ items, fields, indices }}
	on:select={handle}
	on:move={handle}
	on:expand={handle}
	on:collapse={handle}
	tabindex="0"
	class={className}
>
	<NestedList {items} {fields} {using} bind:value {...$$restProps} />
</tree>
