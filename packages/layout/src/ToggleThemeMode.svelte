<script>
	import { defaultStateIcons } from '@rokkit/core'
	import { theme } from '@rokkit/stores'
	import { Toggle } from '@rokkit/organisms'

	let { darkModeIcon = defaultStateIcons.mode.dark, lightModeIcon = defaultStateIcons.mode.light } =
		$props()
	const options = [
		{ label: 'Light Mode', value: 'light', icon: darkModeIcon },
		{ label: 'Dark Mode', value: 'dark', icon: lightModeIcon }
	]
	let value = $state(options.find((x) => x.value === $theme.mode))

	function update(e) {
		theme.update((x) => ({ ...x, mode: e.detail.value }))
	}
</script>

<Toggle bind:value {options} on:change={update} />
