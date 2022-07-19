<script>
	import { createEventDispatcher } from 'svelte'
	import { defaultFields } from './constants'

	const dispatch = createEventDispatcher()

	export let item
	export let component = null
	export let fields

	$: fields = { ...defaultFields, ...fields }

	$: isObject = item && typeof item === 'object'
	$: hasIcon = isObject && 'iconURL' in item
	$: label = isObject ? item[fields.text] : item || ''
</script>

{#if component}
	<svelte:component
		this={component}
		bind:data={item}
		on:change={(event) => dispatch('change', event.detail)}
		on:click={(event) => dispatch('click', event.detail)}
	/>
{:else}
	{#if hasIcon}
		<img class="h-8" src={item.iconURL} alt={label} />
	{/if}
	{label}
{/if}
