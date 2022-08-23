<script>
	import Slider from '../../list/Slider.svelte'
	import List from '../../list/List.svelte'

	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()

	let className = ''
	export { className as class }
	export let value = null
	export let options = []
	export let fields = {}
	export let using = {}
	export let searchable = false
	let search = ''
	let visible = false

	function handleSelect(event) {
		value = event.detail
		dispatch('select', value)
	}
	$: filtered = search.trim().length
		? options.filter((opt) => opt[fields.text].includes(search))
		: options
</script>

<input-select class="flex flex-col relative {className}">
	<span
		class="flex flex-row w-full items-center"
		on:focus={() => (visible = true)}
		on:blur={() => (visible = false)}
	>
		<input type="text" bind:value={search} class:searchable class="flex" />
		<icon class="i-carbon-chevron-sort" />
	</span>
	<slot />
	{#if visible}
		<Slider>
			<List items={filtered} {fields} {using} on:select={handleSelect} />
		</Slider>
	{/if}
</input-select>
