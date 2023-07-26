<script>
	import { createEventDispatcher } from 'svelte'
	import { defaultFields, getText } from '@rokkit/core'
	const dispatch = createEventDispatcher()

	let className = ''

	export { className as class }
	export let items = []
	export let fields = {}

	$: fields = { ...defaultFields, ...fields }

	function handle(item) {
		dispatch('click', item)
	}
</script>

<button-group class="flex flex-row {className}">
	{#each items as item}
		{@const text = getText(item, fields)}
		<button
			on:click={() => handle(item)}
			class="flex cursor-pointer select-none"
		>
			{text}
		</button>
	{/each}
</button-group>
