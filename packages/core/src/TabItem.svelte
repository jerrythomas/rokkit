<script>
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	export let fields = {}
	export let using = {}
	export let value = null
	export let index = 0
	export let icons
	export let selected = false
	export let removable = false

	$: component = value[fields.component]
		? using[value[fields.component]] || using.default
		: using.default
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<tab
	class="flex flex-row items-center"
	role="option"
	aria-selected={selected}
	data-path={index}
>
	<svelte:component this={component} {value} {fields} />
	{#if removable}
		<icon class={icons.close} on:click={() => dispatch('remove')} />
	{/if}
</tab>
