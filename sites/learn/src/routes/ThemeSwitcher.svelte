<script>
	import { vibe } from '@rokkit/states'
	import { ToggleThemeMode } from '@rokkit/ui'
	// import { InputSelect } from '@rokkit/forms'
	let {
		themes = $bindable([
			{ text: 'Rokkit', value: 'rokkit' },
			{ text: 'Minimal', value: 'minimal' },
			{ text: 'Material', value: 'material' }
		])
	} = $props()

	// let currentTheme = $state(themes.find(({ value }) => value === vibe.style))
	// function handleThemeChange(d) {
	// 	vibe.style = d.value
	// }
</script>

<!-- <InputSelect options={themes} bind:value={currentTheme} onchange={handleThemeChange}></InputSelect> -->

<ToggleThemeMode />
