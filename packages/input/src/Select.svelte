<script>
	import {
		Slider,
		Icon,
		List,
		defaultFields,
		defaultStateIcons
	} from '@rokkit/core'
	import { dismissable } from '@rokkit/core/actions'
	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()

	let className = ''
	export { className as class }
	export let items = []
	export let fields = {}
	export let using = {}
	export let value = null
	export let placeholder = ''
	export let searchable = false

	let search = value ? value[fields.text] : ''
	let visible = false
	let offsetTop
	let icons = defaultStateIcons.selector

	// function handleFocusIn() {
	// 	visible = true
	// }
	// function handleFocusOut() {
	// 	visible = false
	// }
	function handleSelect() {
		if (value != null) search = value[fields.text]
		visible = false
		dispatch('select', value)
	}
	$: fields = { ...defaultFields, ...fields }
	$: filtered = search.trim().length
		? items.filter((opt) => opt[fields.text].includes(search))
		: items
</script>

<!-- on:focusin={handleFocusIn}
on:focusout={handleFocusOut}
tabindex="0" -->

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<input-select
	class="flex flex-col relative {className}"
	class:open
	tabindex="0"
	use:dismissable
	on:blur={() => (open = false)}
	on:dismiss={() => (open = false)}
>
	<slot />
	<button
		on:click|stopPropagation={() => (open = !open)}
		class="flex w-full"
		bind:clientHeight={offsetTop}
		tabindex="-1"
	>
		<svelte:component
			this={using.default}
			content={value ?? placeholder}
			{fields}
		/>
		{#if open}
			<Icon name={icons.opened} />
		{:else}
			<Icon name={icons.closed} />
		{/if}
	</button>
	{#if open}
		<Slider top={offsetTop}>
			<List
				items={filtered}
				{fields}
				{using}
				bind:value
				on:select={handleSelect}
			/>
		</Slider>
	{/if}
	<!-- <span class="flex flex-row w-full items-center relative">
		<input
			type="text"
			bind:value={search}
			class:searchable
			class:inactive={!visible}
			class="flex flex-grow"
		/>
		<square class="h-full position-absolute right-0">
			<icon class="i-carbon-chevron-sort" />
		</square>
	</span> -->
	<!-- <slot /> -->
	<!-- {#if visible}
		<Slider>
		<List
			items={filtered}
			{fields}
			{using}
			bind:value
			on:click={handleSelect}
		/>
		</Slider>
	{/if} -->
</input-select>
