<script>
	import { createEventDispatcher } from 'svelte'
	import { defaultFields, defaultStateIcons } from '../constants'
	import Item from './Item.svelte'
	import Icon from '../Icon.svelte'

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

	$: component =
		typeof value == 'object'
			? using[value[fields.component] ?? 'default']
			: using.default
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
			name={icons.remove}
			role="button"
			label="Remove"
			size="small"
			on:click={handleClick}
		/>
	{/if}
</wrap-item>
