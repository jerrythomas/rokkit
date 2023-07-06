<script>
	import { inputTypes } from './input'

	export let value
	export let type = 'text'
</script>

{#if type in inputTypes}
	<svelte:component
		this={inputTypes[type]}
		bind:value
		{...$$restProps}
		on:change
		on:focus
		on:blur
	/>
{:else}
	<error>Type "{type}" is not supported by Input</error>
{/if}
