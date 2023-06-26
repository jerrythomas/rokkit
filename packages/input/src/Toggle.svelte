<script>
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	export let checked = false
	export let header
	export let label
	export let pass = false
	export let fail = false
	export let disabled = false

	function toggle() {
		checked = !checked
		dispatch('change', { checked })
	}

	function handleKeypress(event) {
		if (event.key === ' ') toggle()
	}

	// $: icon = checked ? 'RadioOn' : 'RadioOff'
	// $: text = header == '' ? label : `${header}. ${label}`

	// $: console.log('header', header)
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<toggle
	class="justify-top flex flex-row items-start space-x-4 rounded-lg bg-accent-200 p-4 text-accent-900 shadow outline-none focus:border focus:border-accent-500"
	tabindex="0"
	on:click={toggle}
	on:keypress={handleKeypress}
	class:disabled
	class:pass
	class:fail
>
	<!-- <Icon name={icon} title={text} /> -->
	<span class="flex-grow space-y-2">
		{#if header}
			<h1 class="font-bold">{header}</h1>
		{/if}
		<p class="text-sm">{label}</p>
	</span>
</toggle>
