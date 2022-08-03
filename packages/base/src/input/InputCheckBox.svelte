<script>
	import { createEventDispatcher } from 'svelte'
	import { defaultStateIcons } from '../constants'
	import CheckBox from '../base/CheckBox.svelte'
	import { uniqueId } from '../string'
	const dispatch = createEventDispatcher()

	export let id = uniqueId()
	export let value = false
	export let label
	export let readOnly = false
	export let pass = false
	export let fail = false
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
	class:readOnly
	class:pass
	class:fail
	on:click={toggle}
>
	<CheckBox {id} bind:value {readOnly} {pass} {fail} {stateIcons} />
	<label for={id} class="cursor-pointer">{label}</label>
</checkbox>
