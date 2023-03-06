<script>
	import { defaultFields } from '../constants'
	import Text from './Text.svelte'

	export let content
	export let fields = {}
	export let using = {}

	$: fields = { ...defaultFields, ...fields }
	$: using = { default: Text, ...using }
	$: hasItems = content[fields.children] && content[fields.children].length > 0
	$: component = using[content[fields.component] ?? 'default']
</script>

<summary
	class="flex flex-row flex-shrink-0 items-center w-full cursor-pointer"
	tabindex="-1"
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
