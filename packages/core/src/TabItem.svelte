<script>
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	export let icon = null
	export let label
	export let active = false
	export let removable = false
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<tab class="flex flex-row items-center" class:active on:click>
	{#if icon}
		<icon class={icon} aria-label={icon} />
	{/if}
	{#if label}
		<p class="flex flex-shrink-0 flex-grow justify-center">{label}</p>
	{/if}
	{#if removable}
		<icon
			class="remove small"
			aria-label="remove"
			on:click={() => dispatch('remove')}
		/>
	{/if}
</tab>
