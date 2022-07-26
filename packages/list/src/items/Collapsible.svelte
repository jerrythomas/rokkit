<script>
	import { createEventDispatcher } from 'svelte'
	import { Icon } from '@sparsh-ui/icons'

	const dispatch = createEventDispatcher()
	export let content
	export let fields

	function toggle() {
		content.isOpen = !content.isOpen
		dispatch('toggle', content)
	}
</script>

<collapsible
	class="flex flex-row flex-shrink-0 items-center w-full leading-loose cursor-pointer min-h-8"
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
		<Icon name={content[fields.icon]} title={content[fields.text]} />
	{/if}
	<p class="flex flex-grow">{content[fields.text]}</p>
	{#if content.isOpen}
		<Icon name="chevron-down" title="Collapse" />
	{:else}
		<Icon name="chevron-right" title="Expand" />
	{/if}
</collapsible>
