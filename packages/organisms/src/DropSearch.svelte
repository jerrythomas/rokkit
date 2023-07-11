<script>
	import { defaultFields } from '@rokkit/core'
	import List from './List.svelte'
	import { Slider } from '@rokkit/atoms'
	import { Item } from '@rokkit/molecules'

	export let items
	export let value = null
	/** @type {import('@rokkit/core').FieldMapping} */
	export let fields = defaultFields
	export let using = { default: Item }

	$: using = { default: Item, ...using }
	$: fields = { ...defaultFields, ...fields }

	let opened = false
	let search
	let searchBox

	// on search change filter list
	function handleSelect(event) {
		console.log('selected', event)
		value = event.detail
		search = event.detail[fields.text]
	}
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<div
	class="dropdown relative h-12 w-full flex flex-col outline-none"
	tabindex={0}
>
	<div class="selected-item h-12 flex flex-shrink-0 items-center pl-4">
		<span class="flex flex-grow">
			<input
				type="text"
				class="w-full border-none bg-transparent p-0"
				bind:value={search}
				bind:this={searchBox}
				on:focus={() => {
					opened = true
					searchBox.select()
				}}
				on:blur={() => {
					opened = false
				}}
			/>
		</span>
		{#if opened}
			<icon class="selector-opened" />
		{:else}
			<icon class="selector-closed" />
		{/if}
	</div>

	{#if opened}
		<Slider>
			<List
				bind:items
				bind:value
				{fields}
				{using}
				on:select={handleSelect}
				on:change
			/>
		</Slider>
	{/if}
</div>
