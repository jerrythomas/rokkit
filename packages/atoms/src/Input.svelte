<script>
	import { getContext } from 'svelte'
	import { nativeInputTypes } from './input'

	const registry = getContext('registry')

	export let value
	export let type = 'text'
	export let using = {}

	$: using = { ...nativeInputTypes, ...using, ...$registry }
</script>

{#if type in using}
	<svelte:component
		this={using[type]}
		bind:value
		{...$$restProps}
		on:change
		on:focus
		on:blur
	/>
{:else}
	<error>Type "{type}" is not supported by Input</error>
{/if}
