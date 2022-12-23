<script>
	import { wrappedInput } from './types'

	export let value
	export let type = 'text'
</script>

{#if type in wrappedInput}
	<svelte:component
		this={wrappedInput[type]}
		bind:value
		{...$$restProps}
		on:change
		on:focus
		on:blur
	/>
{:else}
	<error>Type "{type}" is not supported by Input</error>
{/if}
