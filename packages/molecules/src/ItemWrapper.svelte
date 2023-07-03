<script>
	import { createEventDispatcher } from 'svelte'
	import { Icon } from '@rokkit/atoms'
	import { defaultFields, defaultStateIcons, getComponent } from '@rokkit/core'
	import Item from './Item.svelte'

	const dispatch = createEventDispatcher()

	let className = ''
	export { className as class }
	export let value
	export let fields = defaultFields
	export let using = { default: Item }
	export let removable = false
	export let selected = false
	export let index = null
	export let icons = defaultStateIcons.action

	function handleClick() {
		dispatch('remove', value)
	}

	$: icon = icons?.remove ?? defaultStateIcons.action.remove
	$: component = getComponent(value, fields, using)
</script>

<wrap-item
	class="flex flex-row items-center {className}"
	role="option"
	aria-selected={selected}
	data-path={index}
>
	<item class="flex flex-row items-center">
		<svelte:component this={component} bind:value {fields} />
	</item>
	{#if removable}
		<Icon
			name={icon}
			role="button"
			label="Remove"
			size="small"
			on:click={handleClick}
		/>
	{/if}
</wrap-item>
