<script>
	import { defaultStateIcons } from '@rokkit/core'
	import { vibe } from '@rokkit/states'
	import Toggle from './Toggle.svelte'

	let {
		icons = defaultStateIcons.mode,
		labels = ['Light Mode', 'Dark Mode'],
		square = false
	} = $props()

	const options = $derived([
		{ label: labels[0], value: 'light', icon: icons.light },
		{ label: labels[1], value: 'dark', icon: icons.dark }
	])
	let value = $derived(options.find((x) => x.value === vibe.mode))

	function update(e) {
		vibe.mode = e.value
	}
</script>

<Toggle {value} {options} onchange={update} {square} />
