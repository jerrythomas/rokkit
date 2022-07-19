<script>
	import { Icon } from '@sparsh-ui/icons'
	import List from './List.svelte'
	import Slider from './Slider.svelte'
	// import DropDownIcon from './icons/DropDownIcon.svelte'

	export let data
	export let component = null
	export let selected = null
	export let key = 'id'
	export let selectedKey

	let opened = false
	let search
	let searchBox

	// on search change filter list
	function handleSelect(event) {
		console.log('selected', event)
		selected = event.detail
		search = event.detail.name
	}
</script>

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
		<Icon name="selector" />
	</div>

	{#if opened}
		<Slider>
			<List
				bind:items={data}
				{key}
				{component}
				bind:selected={selectedKey}
				on:select={handleSelect}
				on:change
			/>
		</Slider>
	{/if}
</div>
