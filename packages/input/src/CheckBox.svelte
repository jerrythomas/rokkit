<script>
	import { defaultStateIcons } from './lib/constants'

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

	$: pass = status === 'pass'
	$: fail = status === 'fail'
	$: state = value === null ? 'unknown' : value ? 'checked' : 'unchecked'
	$: flexDirection = textAfter ? 'flex-row' : 'flex-row-reverse'
</script>

<checkbox
	{id}
	class="flex {flexDirection} items-center leading-loose cursor-pointer select-none checkbox {className}"
	class:disabled
	class:pass
	class:fail
>
	<label class="flex flex-row items-center leading-loose gap-1">
		<input hidden {name} type="checkbox" bind:checked={value} on:change />
		<icon class={stateIcons[state]} />
		{#if label}
			<p>{label}</p>
		{/if}
	</label>
</checkbox>
