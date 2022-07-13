<script>
	import { toPascalCase } from '@sparsh-ui/core'
	import { iconStore } from './store.js'

	export let size = '1.5em'
	export let name
	export let title = name
	export let fill = 'none'
	export let stroke = 'currentColor'
	export let isActive = false
	export let icon = $iconStore[toPascalCase(name)]
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	class="{$$props.class ? $$props.class : ''} icon"
	class:isActive
	{fill}
	{stroke}
	height={size}
	width={size}
	viewBox="0 0 24 24"
	on:hover
	on:mouseover
	on:focus
	on:click
>
	<title>{title}</title>
	<svelte:component this={icon} />
</svg>

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
