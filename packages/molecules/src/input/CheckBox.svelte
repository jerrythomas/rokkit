<script>
	import { defaultStateIcons } from '@rokkit/core'

	let className = ''
	export { className as class }
	export let id = null
	export let name
	export let value = false
	export let native = false
	export let readOnly = false
	export let stateIcons = defaultStateIcons.checkbox
	export let tabindex = 0

	$: state = value === null ? 'unknown' : value ? 'checked' : 'unchecked'

	function handleClick() {
		if (readOnly) return
		value = !value
	}
	function handleKeydown(event) {
		if (readOnly) return
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault()
			value = !value
		}
	}
</script>

<checkbox
	{id}
	class="flex items-center leading-loose cursor-pointer select-none checkbox {className}"
	class:disabled={readOnly}
	role="checkbox"
	aria-checked={state}
	aria-disabled={readOnly}
	on:click={handleClick}
	on:keydown={handleKeydown}
	{tabindex}
>
	<input
		hidden={!native}
		type="checkbox"
		{name}
		{readOnly}
		bind:checked={value}
		on:change
	/>
	{#if !native}
		<icon class={stateIcons[state]} />
	{/if}
</checkbox>
