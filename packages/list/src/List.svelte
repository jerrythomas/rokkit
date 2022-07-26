<script>
	import { onMount, createEventDispatcher } from 'svelte'
	import { defaultFields } from './constants'
	import { Text } from './items'

	const dispatch = createEventDispatcher()

	export let items = []
	export let fields = {}
	export let using = {}

	let active = []

	onMount(() => {
		active = Array.from({ length: items.length }, (_) => false)
	})

	let previous = null
	$: fields = { ...defaultFields, ...fields }
	$: using = { default: Text, ...using }
	$: style = $$props.class || 'list'

	function handleClick(index) {
		if (previous !== null) active[previous] = false
		active[index] = true
		previous = index
		dispatch('click', items[index])
	}
</script>

<ul class="flex flex-col w-full flex-shrink-0 select-none {style}">
	{#each items as item, index}
		{@const component = item[fields.component]
			? using[item[fields.component]] || using.default
			: using.default}
		<li
			class="flex flex-shrink-0 flex-grow-0 min-h-8 items-center cursor-pointer leading-loose w-full gap-2 select-none item"
			class:active={active[index]}
			on:click={() => handleClick(index)}
		>
			<svelte:component
				this={component}
				bind:content={item}
				{fields}
				on:change
				on:click={() => handleClick(item)}
			/>
		</li>
	{/each}
</ul>
