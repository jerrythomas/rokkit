<script>
	import { defaultStateIcons } from '@rokkit/core'

	let className = ''
	export { className as class }
	export let id = null
	export let name
	export let value = false
	export let readOnly = false
	export let stateIcons = defaultStateIcons.checkbox
	export let tabindex = 0

	$: state = value === null ? 'unknown' : value ? 'checked' : 'unchecked'

	function toggle(event) {
		event.preventDefault()
		event.stopPropagation()
		value = !value
	}
	function handleClick(event) {
		if (!readOnly) toggle(event)
	}
	function handleKeydown(event) {
		if (readOnly) return
		if (event.key === 'Enter' || event.key === ' ') toggle(event)
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
	<input hidden type="checkbox" {name} {readOnly} bind:checked={value} on:change />

	<icon class={stateIcons[state]} />
</checkbox>
