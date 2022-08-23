<script>
	import { createEventDispatcher } from 'svelte'
	// import Icon from '../../layout/Icon.svelte'

	const dispatch = createEventDispatcher()

	export let icon = null
	export let label
	export let active = false
	export let removable = false
</script>

<tab class="flex flex-row items-center" class:active on:click>
	{#if icon}
		<icon class={icon} />
	{/if}
	<p class="flex flex-shrink-0 flex-grow justify-center">{label}</p>
	{#if removable}
		<icon
			class="remove small"
			aria-label="remove"
			on:click={() => dispatch('remove')}
		/>
	{/if}
</tab>
