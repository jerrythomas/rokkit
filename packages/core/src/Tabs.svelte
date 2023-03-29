<script>
	import { defaultFields } from './constants'
	import { Text } from './items'
	import { navigator } from './actions'
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	let className = ''
	export { className as class }
	export let items = []
	export let fields = {}
	export let using = {}
	export let value = null
	let cursor = []

	function handleNav(event) {
		value = event.detail.node
		cursor = event.detail.path

		dispatch('select', { item: value, indices: cursor })
	}
	$: fields = { ...defaultFields, ...fields }
	$: using = { default: Text, ...using }
</script>

<tabs
	class="flex w-full {className}"
	tabindex="0"
	role="listbox"
	use:navigator={{
		items,
		fields,
		vertical: false,
		indices: cursor
	}}
	on:move={handleNav}
	on:select={handleNav}
>
	{#each items as item, index}
		{@const component = item[fields.component]
			? using[item[fields.component]] || using.default
			: using.default}

		<item class="flex" class:is-selected={item === value} data-path={index}>
			<svelte:component this={component} content={item} {fields} />
		</item>
	{/each}
</tabs>
