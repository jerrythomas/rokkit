<script>
	import { getContext } from 'svelte'
	import { types } from './types'

	const registry = getContext('registry')

	let { value, type = 'text', using = {}, ...restProps } = $props()

	using = { ...types, ...using, ...registry?.editors }
	let Template = using[type]
</script>

{#if type in using}
	<Template bind:value {...restProps} on:change on:focus on:blur />
{:else}
	<error>Type "{type}" is not supported by Input</error>
{/if}
