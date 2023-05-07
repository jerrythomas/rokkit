<script>
	import { defaultFields } from '../constants'
	import Text from './Text.svelte'

	export let value
	export let fields = {}
	export let using = {}

	$: fields = { ...defaultFields, ...fields }
	$: using = { default: Text, ...using }
	$: hasItems = value[fields.children] && value[fields.children].length > 0
	$: component = using[value[fields.component] ?? 'default']
</script>

<summary
	class="flex flex-row flex-shrink-0 items-center w-full cursor-pointer"
	tabindex="-1"
>
	<svelte:component this={component} bind:value {fields} />
	{#if hasItems}
		{#if value[fields.isOpen]}
			<icon class="sm accordion-opened" aria-label="expand" />
		{:else}
			<icon class="sm accordion-closed" aria-label="collapse" />
		{/if}
	{/if}
</summary>
