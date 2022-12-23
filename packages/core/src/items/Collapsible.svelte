<script>
	import { createEventDispatcher } from 'svelte'
	import { defaultFields } from '../constants'

	const dispatch = createEventDispatcher()

	export let content
	export let fields = {}

	$: fields = { ...defaultFields, ...fields }
	$: hasItems = content[fields.data] && content[fields.data].length > 0

	function toggle() {
		if (hasItems) {
			content.isOpen = !content.isOpen
		}
		dispatch('toggle', content)
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
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
	{#if content[fields.url]}
		<a href={content[fields.url]} class="flex flex-grow">
			{content[fields.text]}
		</a>
	{:else}
		<p class="flex flex-grow">{content[fields.text]}</p>
	{/if}
	{#if hasItems}
		{#if content.isOpen}
			<icon class="sm accordion-opened" aria-label="expand" />
		{:else}
			<icon class="sm accordion-closed" aria-label="collapse" />
		{/if}
	{/if}
</collapsible>
