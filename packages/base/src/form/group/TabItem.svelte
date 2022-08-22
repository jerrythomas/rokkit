<script>
	import { createEventDispatcher } from 'svelte'
	import Icon from '../../layout/Icon.svelte'

	const dispatch = createEventDispatcher()

	export let icon = null
	export let label
	export let active = false

	export let allowClose = false
</script>

<tab class="flex flex-row items-center" class:active on:click>
	{#if icon}
		<Icon name={icon} title={label} />
	{/if}
	<p class="flex flex-shrink-0 flex-grow justify-center">{label}</p>
	{#if allowClose}
		<Icon size="1em" name="close" on:click={() => dispatch('close')} />
	{/if}
</tab>
