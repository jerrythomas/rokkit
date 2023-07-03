<script>
	import { createEventDispatcher } from 'svelte'
	import { defaultFields } from '@rokkit/core'
	import { navigator } from '@rokkit/actions'
	import { Item } from '@rokkit/molecules'
	import NestedList from './NestedList.svelte'

	const dispatch = createEventDispatcher()
	let className = 'list'
	export { className as class }
	export let items = []
	export let fields = {}
	export let using = { default: Item }
	export let root = null
	export let value = null

	let indices = []

	function handle(event) {
		value = event.detail.node
		indices = event.detail.path
		if (['collapse', 'expand'].includes(event.type)) {
			items = items
		}
		dispatch(event.type, value)
	}

	$: fields = { ...defaultFields, ...fields }
	$: items =
		items[0][fields.text] == root || root == null
			? items
			: [
					{
						[fields.text]: root,
						[fields.isOpen]: true,
						[fields.children]: items
					}
			  ]
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
