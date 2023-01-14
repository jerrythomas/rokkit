<script>
	import { Slider, ListItems, defaultFields } from '@rokkit/core'

	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()

	let className = ''
	export { className as class }
	export let value = null
	export let items = []
	export let fields = {}
	export let using = {}
	export let searchable = false

	let search = value ? value[fields.text] : ''
	let visible = false

	function handleFocusIn() {
		visible = true
	}
	function handleFocusOut() {
		visible = false
	}
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

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<input-select
	class="flex flex-col relative {className}"
	on:focusin={handleFocusIn}
	on:focusout={handleFocusOut}
	tabindex="0"
>
	<span class="flex flex-row w-full items-center relative">
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
	</span>
	<slot />
	{#if visible}
		<Slider>
			<ListItems
				items={filtered}
				{fields}
				{using}
				bind:value
				on:click={handleSelect}
			/>
		</Slider>
	{/if}
</input-select>
