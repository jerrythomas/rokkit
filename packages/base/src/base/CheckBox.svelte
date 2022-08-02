<script>
	import { createEventDispatcher } from 'svelte'
	import { defaultStateIcons } from '../constants'

	const dispatch = createEventDispatcher()

	export let id
	export let value
	export let readOnly = false
	export let pass
	export let fail
	export let stateIcons = defaultStateIcons.checkbox

	const toggle = () => {
		if (!disabled) {
			value = !value
			dispatch('change', { checked: value })
		}
	}

	$: disabled = readOnly || pass || fail
	$: state = value === null ? 'unknown' : value ? 'checked' : 'unchecked'
</script>

<icon
	{id}
	class="{stateIcons[state]} cursor-pointer select-none checkbox"
	class:pass
	class:fail
	class:disabled={readOnly}
	on:click|preventDefault={toggle}
/>
