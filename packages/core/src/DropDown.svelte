<script>
	import Icon from './Icon.svelte'
	import Text from './items/Text.svelte'
	import ListItems from './ListItems.svelte'
	import { defaultFields } from './constants.js'
	import { dismissable } from './actions'
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	let className = ''
	export { className as class }
	export let items = []
	export let fields = defaultFields
	export let using = { default: Text }
	export let value = null
	export let placeholder = 'Select a value'

	$: using = { default: Text, ...using }
	$: fields = { ...defaultFields, ...fields }

	let offsetTop = 0
	let open = false

	function handleSelect(event) {
		open = false
		dispatch('change', event.detail)
	}
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<div
	class="flex w-full relative cursor-pointer dropdown {className}"
	class:open
	tabindex="0"
	use:dismissable
	on:blur={() => (open = false)}
	on:dismiss={() => (open = false)}
>
	<button
		on:click|stopPropagation={() => (open = !open)}
		class="flex w-full"
		bind:clientHeight={offsetTop}
		tabindex="-1"
	>
		<svelte:component this={using.default} content={value ?? placeholder} />
		<Icon name="dropdown-opened" />
	</button>
	{#if open}
		<div
			class="flex flex-col absolute z-10 h-fit w-full menu"
			style:top="{offsetTop}px"
		>
			<ListItems
				{items}
				{fields}
				{using}
				bind:activeItem={value}
				on:select={handleSelect}
			/>
		</div>
	{/if}
</div>
