<script>
	import { Icon } from '@sparsh-ui/icons'
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	export let value = 0
	export let max = 5
	export let editable = true
	export let fill = 'currentColor'
	export let stroke = 'orange'
	export let size = '1.5em'

	function handleClick(index) {
		if (editable) {
			// console.log(value, index)
			value = value == 1 && index == 0 ? index : index + 1

			dispatch('change', { value })
		}
	}

	$: stars = [...Array(max).keys()].map((i) => i < value)
</script>

<input type="number" min="0" {max} hidden bind:value />
<div
	class="flex flex-shrink-0 flex-grow-0 fit-content m-auto text-secondary-400"
>
	{#each stars as selected, index}
		<Icon
			name="Star"
			fill={selected ? fill : 'none'}
			{stroke}
			{size}
			class=""
			on:click={() => handleClick(index)}
		/>
	{/each}
</div>
