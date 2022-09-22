<script>
	import { omit } from 'ramda'
	import { iconStore } from '../stores'

	export let size = '1.5em'
	export let name = ''
	export let fill = 'none'
	export let stroke = 'currentColor'

	export let icon = $iconStore[name]
	$: props = omit(['class'], $$restProps)
</script>

{#if typeof icon === 'string'}
	<icon
		class="{icon} {$$restProps.class || ''}"
		{...props}
		on:hover
		on:mouseover
		on:focus
		on:click
	/>
{:else}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		class="{$$restProps.class || ''} icon"
		height={size}
		width={size}
		viewBox="0 0 24 24"
		{fill}
		{stroke}
		{...props}
		on:hover
		on:mouseover
		on:focus
		on:click
	>
		<svelte:component this={icon} />
	</svg>
{/if}

<style>
	svg {
		display: flex;
		margin: auto;
		flex-shrink: 0;
		flex-grow: 0;
	}
	svg:focus {
		outline: none;
	}
</style>
