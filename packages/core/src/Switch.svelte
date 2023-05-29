<script>
	import { createEventDispatcher } from 'svelte'
	import { defaultFields } from './constants'
	import { Item } from './items'
	import { navigator } from './actions'
	import { getComponent } from './lib'

	const dispatch = createEventDispatcher()

	let className = ''
	export { className as class }
	export let items = [false, true]
	export let fields = defaultFields
	export let using = {}
	export let compact = true
	export let value
	let cursor = []

	function handleNav(event) {
		value = event.detail.node
		cursor = event.detail.path

		dispatch('change', { item: value, indices: cursor })
	}

	$: useComponent = !items.every((item) => [false, true].includes(item))
	$: fields = { ...defaultFields, ...fields }
	$: using = { default: Item, ...using }
</script>

{#if !Array.isArray(items) || items.length < 2}
	<error>Items should be an array with at least two items.</error>
{:else}
	<toggle-switch
		class="flex items-center {className}"
		class:is-off={items.length == 2 && value === items[0]}
		class:is-on={items.length == 2 && value === items[1]}
		class:compact
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
		{#each items as item, index (item)}
			{@const component = useComponent
				? getComponent(item, fields, using)
				: null}
			<item
				class="relative flex"
				role="option"
				aria-selected={item === value}
				data-path={index}
			>
				{#if item == value}
					<indicator class="absolute bottom-0 left-0 right-0 top-0" />
				{/if}
				{#if component}
					<svelte:component this={component} value={item} {fields} />
				{/if}
			</item>
		{/each}
	</toggle-switch>
{/if}
