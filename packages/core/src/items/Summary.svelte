<script>
	import { defaultFields } from '../constants'
	import Text from './Text.svelte'

	export let content
	export let fields = {}
	export let using = {}

	$: fields = { ...defaultFields, ...fields }
	$: using = { default: Text, ...using }
	$: hasItems = content[fields.data] && content[fields.data].length > 0
	$: component = using[content[fields.component] ?? 'default']
</script>

<!-- class:expanded={content[fields.isOpen]} -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<summary
	class="flex flex-row flex-shrink-0 items-center w-full cursor-pointer"
	on:click
>
	<svelte:component this={component} bind:content {fields} />
	{#if hasItems}
		{#if content[fields.isOpen]}
			<icon class="sm accordion-opened" aria-label="expand" />
		{:else}
			<icon class="sm accordion-closed" aria-label="collapse" />
		{/if}
	{/if}
</summary>
