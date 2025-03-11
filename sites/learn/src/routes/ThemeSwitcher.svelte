<script>
	import { vibe } from '@rokkit/states'
	// import { FieldMapper } from '@rokkit/core'
	import { ToggleThemeMode } from '@rokkit/ui'
	import { InputSelect } from '@rokkit/input'
	// import { Select, ToggleThemeMode } from '@rokkit/ui'

	// let options = [
	// 	{ icon: 'mode-dark', value: 'dark' },
	// 	{ icon: 'mode-light', value: 'light' }
	// ]
	let {
		themes = $bindable([
			{ text: 'Rokkit', value: 'rokkit' },
			{ text: 'Minimal', value: 'minimal' },
			{ text: 'Material', value: 'material' }
		])
	} = $props()

	let currentTheme = $state(themes.find(({ value }) => value === vibe.style))
	function handleThemeChange(d) {
		vibe.style = d.value
	}
</script>

<InputSelect options={themes} bind:value={currentTheme} onchange={handleThemeChange}></InputSelect>
<!-- <Toggle value={currentIcon} {options} onchange={handleModeChange}></Toggle> -->
<ToggleThemeMode />
