<script>
	import { navigator } from './actions'
	import { createEventDispatcher } from 'svelte'
	import { defaultFields } from './constants'
	import { Text } from './items'

	const dispatch = createEventDispatcher()

	let className = 'list'
	export { className as class }
	export let items = []
	export let fields = {}
	export let using = {}
	export let value = null
	export let tabindex = 0
	export let hierarchy = []
	let cursor = []

	function handleNav(event) {
		value = event.detail.node
		cursor = event.detail.path

		dispatch('select', { item: value, indices: cursor })
	}

	$: fields = { ...defaultFields, ...fields }
	$: using = { default: Text, ...using }
	$: filtered = items.filter((item) => !item[fields.isDeleted])
</script>

<list
	class="flex flex-col w-full flex-shrink-0 select-none {className}"
	role="listbox"
	use:navigator={{
		items,
		fields,
		enabled: hierarchy.length == 0,
		indices: cursor
	}}
	on:move={handleNav}
	on:select={handleNav}
	{tabindex}
>
	<slot />
	{#each filtered as item, index}
		{@const component = item[fields.component]
			? using[item[fields.component]] || using.default
			: using.default}
		{@const path = [...hierarchy, index].join(',')}
		<item
			class="flex flex-shrink-0 flex-grow-0 min-h-8 items-center cursor-pointer w-full gap-2 select-none item"
			role="option"
			aria-selected={value === item}
			class:is-selected={value === item}
			data-path={path}
		>
			<svelte:component
				this={component}
				bind:content={item}
				{fields}
				on:change
			/>
		</item>
	{/each}
</list>
