<script>
	import { defaultStateIcons } from '@rokkit/core'

	let className = ''
	export { className as class }
	export let id = null
	export let name
	export let value = false
	export let label = null
	export let disabled = false
	export let status = 'default'
	export let textAfter = true
	export let stateIcons = defaultStateIcons.checkbox
	export let tabindex = 0

	$: pass = status === 'pass'
	$: fail = status === 'fail'
	$: state = value === null ? 'unknown' : value ? 'checked' : 'unchecked'
	$: flexDirection = textAfter ? 'flex-row' : 'flex-row-reverse'

	function handleClick() {
		if (disabled) return
		value = !value
	}
	function handleKeydown(event) {
		if (disabled) return
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault()
			value = !value
		}
	}
</script>

<checkbox
	{id}
	class="flex {flexDirection} items-center leading-loose cursor-pointer select-none checkbox {className}"
	class:disabled
	class:pass
	class:fail
	role="checkbox"
	aria-checked={state}
	aria-disabled={disabled}
	on:click={handleClick}
	on:keydown={handleKeydown}
	{tabindex}
>
	<label class="flex flex-row items-center gap-1 leading-loose">
		<input hidden {name} type="checkbox" bind:checked={value} on:change />
		<icon class={stateIcons[state]} />
		{#if label}
			<p>{label}</p>
		{/if}
	</label>
</checkbox>
