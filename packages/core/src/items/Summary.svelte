<script>
	import { createEventDispatcher } from 'svelte'
	import { defaultFields } from '../constants'
	import Text from './Text.svelte'

	const dispatch = createEventDispatcher()

	export let content
	export let fields = {}
	export let using = {}

	$: fields = { ...defaultFields, ...fields }
	$: using = { default: Text, ...using }
	$: hasItems = content[fields.data] && content[fields.data].length > 0
	$: component = using[content[fields.component] ?? 'default']

	function toggle() {
		if (hasItems) {
			content[fields.isOpen] = !content[fields.isOpen]
		}
		dispatch('toggle', content)
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<summary
	class="flex flex-row flex-shrink-0 items-center w-full leading-loose cursor-pointer"
	class:expanded={content[fields.isOpen]}
	on:click={toggle}
>
	<svelte:component this={component} bind:content />
	<!-- {#if content[fields.image]}
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
	{/if} -->
	{#if hasItems}
		{#if content[fields.isOpen]}
			<icon class="sm accordion-opened" aria-label="expand" />
		{:else}
			<icon class="sm accordion-closed" aria-label="collapse" />
		{/if}
	{/if}
</summary>
