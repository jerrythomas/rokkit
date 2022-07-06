<script>
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	export let item
	export let component = null

	$: isObject = item && typeof item === 'object'
	$: hasIcon = isObject && 'iconURL' in item
	$: label = isObject ? item.title || item.label || item.name : item || ''
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
