<script>
	import { defaultFields } from './constants.js'
	import List from './List.svelte'
	import Slider from './Slider.svelte'
	import { Item } from './items'

	export let data
	export let value = null
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
	class="flex flex-col outline-none w-full h-12 relative dropdown"
	tabindex={0}
>
	<div class="flex flex-shrink-0 h-12 items-center pl-4 selected-item">
		<span class="flex flex-grow">
			<input
				type="text"
				class="p-0 border-none bg-transparent w-full"
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
				bind:items={data}
				bind:value
				{fields}
				{using}
				on:select={handleSelect}
				on:change
			/>
		</Slider>
	{/if}
</div>
