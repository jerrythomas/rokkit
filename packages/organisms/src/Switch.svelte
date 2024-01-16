<script>
	import { createEventDispatcher } from 'svelte'
	import { defaultFields, getComponent } from '@rokkit/core'
	import { Item } from '@rokkit/molecules'
	import { navigator } from '@rokkit/actions'

	const dispatch = createEventDispatcher()

	let className = ''
	export { className as class }
	export let value
	export let options = [false, true]
	/** @type {import('@rokkit/core').FieldMapping} */
	export let fields = defaultFields
	export let using = {}
	export let compact = false
	let cursor = []

	function handleNav(event) {
		value = event.detail.node
		cursor = event.detail.path
		dispatch('change', { item: value, indices: cursor })
	}

	$: useComponent = !options.every((item) => [false, true].includes(item))
	$: fields = { ...defaultFields, ...fields }
	$: using = { default: Item, ...using }
</script>

{#if !Array.isArray(options) || options.length < 2}
	<error>Items should be an array with at least two items.</error>
{:else}
	<toggle-switch
		class="flex items-center {className}"
		class:is-off={options.length == 2 && value === options[0]}
		class:is-on={options.length == 2 && value === options[1]}
		class:compact
		tabindex="0"
		role="listbox"
		use:navigator={{
			items: options,
			fields,
			vertical: false,
			indices: cursor
		}}
		on:move={handleNav}
		on:select={handleNav}
	>
		{#each options as item, index (item)}
			{@const component = useComponent ? getComponent(item, fields, using) : null}
			<item class="relative" role="option" aria-selected={item === value} data-path={index}>
				{#if item === value}
					<indicator class="absolute bottom-0 left-0 right-0 top-0" />
				{/if}
				{#if component}
					<svelte:component this={component} value={item} {fields} />
				{/if}
			</item>
		{/each}
	</toggle-switch>
{/if}
