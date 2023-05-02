<script>
	import { createEventDispatcher } from 'svelte'
	import { defaultFields, defaultStateIcons } from '../constants'
	import Text from './Text.svelte'
	const dispatch = createEventDispatcher()

	export let value
	export let fields = defaultFields
	export let using = { default: Text }
	export let removable = false

	function handleClick() {
		dispatch('remove', value)
	}
	$: component =
		typeof value == 'object'
			? using[value[fields.component] ?? 'default']
			: using.default
</script>

<pill class="flex flex-row items-center">
	<item class="flex flex-row items-center">
		<svelte:component this={component} content={value} {fields} />
	</item>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	{#if removable}
		<icon
			class="{defaultStateIcons.action.remove} cursor-pointer"
			on:click={handleClick}
		/>
	{/if}
</pill>
