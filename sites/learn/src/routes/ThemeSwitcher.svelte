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
		themes = [
			{ text: 'Rokkit', value: 'rokkit' },
			{ text: 'Minimal', value: 'minimal' },
			{ text: 'Material', value: 'material' }
		]
	} = $props()

	// let mapping = new FieldMapper({ text: 'title' })
	let currentTheme = $derived(themes.find(({ name }) => name === vibe.style))
	// let currentIcon = $derived(options.find(({ value }) => value === vibe.mode))

	function handleThemeChange(d) {
		vibe.style = d.name
		// theme.update((current) => ({ ...current, name: event.detail.name }))
	}
	// function handleModeChange(d) {
	// 	vibe.mode = d.value
	// }
</script>

<InputSelect options={themes} value={currentTheme} onchange={handleThemeChange}></InputSelect>
<!-- <Toggle value={currentIcon} {options} onchange={handleModeChange}></Toggle> -->
<ToggleThemeMode />
