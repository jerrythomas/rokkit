<script>
	import { createEventDispatcher } from 'svelte'
	import { defaultFields } from '../constants'

	const dispatch = createEventDispatcher()

	export let value
	export let fields = {}

	$: fields = { ...defaultFields, ...fields }
	$: hasItems = value[fields.children] && value[fields.children].length > 0

	function toggle() {
		if (hasItems) {
			value.isOpen = !value.isOpen
		}
		dispatch('toggle', value)
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<collapsible
	class="flex flex-row flex-shrink-0 items-center w-full leading-loose cursor-pointer"
	class:expanded={value.isOpen}
	on:click={toggle}
>
	{#if value[fields.image]}
		<img
			class="h-8 w-8 rounded-full"
			alt={value[fields.text]}
			src={value[fields.image]}
		/>
	{/if}
	{#if value[fields.icon]}
		<icon class={value[fields.icon]} />
	{/if}
	{#if value[fields.url]}
		<a href={value[fields.url]} class="flex flex-grow">
			{value[fields.text]}
		</a>
	{:else}
		<p class="flex flex-grow">{value[fields.text]}</p>
	{/if}
	{#if hasItems}
		{#if value.isOpen}
			<icon class="sm accordion-opened" aria-label="expand" />
		{:else}
			<icon class="sm accordion-closed" aria-label="collapse" />
		{/if}
	{/if}
</collapsible>
