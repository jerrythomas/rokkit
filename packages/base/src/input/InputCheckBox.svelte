<script>
	import { createEventDispatcher } from 'svelte'
	import { defaultStateIcons } from '../constants'
	import CheckBox from '../base/CheckBox.svelte'

	const dispatch = createEventDispatcher()

	export let id
	export let value
	export let label
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
</script>

<checkbox
	class="flex flex-row items-center leading-loose cursor-pointer select-none"
	on:click={toggle}
>
	<CheckBox {id} bind:value {readOnly} {pass} {fail} {stateIcons} />
	<label for="id">{label}</label>
</checkbox>
