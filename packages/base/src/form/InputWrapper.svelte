<script>
	import { wrappedInput } from './types'

	export let value
	export let type = 'text'
</script>

<svelte:component
	this={wrappedInput[type]}
	bind:value
	{...$$restProps}
	on:change
	on:focus
	on:blur
/>
