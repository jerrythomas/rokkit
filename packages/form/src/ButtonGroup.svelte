<script>
	import { createEventDispatcher } from 'svelte'
	import { defaultFields } from 'rokkit/utils'
	const dispatch = createEventDispatcher()

	let className = ''

	export { className as class }
	export let items = []
	export let fields = {}
	export let type = 'toggle'
	export let value = null

	$: fields = { ...defaultFields, ...fields }

	function handle(item) {
		value = type === 'toggle' ? item : value
		dispatch('change', item)
	}
</script>

<button-group class="flex flex-row {className}">
	{#each items as item}
		{@const text = typeof item === 'string' ? item : item[fields.text]}
		<button
			on:click={() => handle(item)}
			class:active={value == item}
			class="flex cursor-pointer select-none"
		>
			{text}
		</button>
	{/each}
</button-group>
