<script>
	import { createEventDispatcher } from 'svelte'
	import { defaultFields } from '../constants'

	const dispatch = createEventDispatcher()
	export let content
	export let fields = defaultFields

	function toggle() {
		content.isOpen = !content.isOpen
		dispatch('toggle', content)
	}
</script>

<collapsible
	class="flex flex-row flex-shrink-0 items-center w-full leading-loose cursor-pointer"
	class:expanded={content.isOpen}
	on:click={toggle}
>
	{#if content[fields.image]}
		<img
			class="h-8 w-8 rounded-full"
			alt={content[fields.text]}
			src={content[fields.image]}
		/>
	{/if}
	{#if content[fields.icon]}
		<icon class={content[fields.icon]} />
	{/if}
	<p class="flex flex-grow">{content[fields.text]}</p>
	{#if content.isOpen}
		<icon class="accordion-opened" aria-label="expand" />
	{:else}
		<icon class="accordion-closed" aria-label="collapse" />
	{/if}
</collapsible>
