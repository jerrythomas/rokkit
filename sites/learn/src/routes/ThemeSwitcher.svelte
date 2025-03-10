<script>
	import { vibe } from '@rokkit/states'
	import { FieldMapper } from '@rokkit/core'
	import { Toggle } from '@rokkit/ui'
	import { InputSelect } from '@rokkit/input'
	// import { Select, ToggleThemeMode } from '@rokkit/ui'

	let options = [
		{ icon: 'mode-dark', value: 'dark' },
		{ icon: 'mode-light', value: 'light' }
	]
	let {
		themes = [
			{ title: 'Rokkit', name: 'rokkit' },
			{ title: 'Minimal', name: 'minimal' },
			{ title: 'Material', name: 'material' }
		]
	} = $props()

	let mapping = new FieldMapper({ text: 'title' })
	let currentTheme = $derived(themes.find(({ name }) => name === vibe.name))
	let currentIcon = $derived(options.find(({ value }) => value === vibe.mode))
	function handleThemeChange(d) {
		vibe.name = d.name
		// theme.update((current) => ({ ...current, name: event.detail.name }))
	}
</script>

<InputSelect
	name="theme"
	options={themes}
	value={currentTheme}
	{mapping}
	on:change={handleThemeChange}
></InputSelect>
<!-- <Toggle value={currentIcon} {options} onchange={(d) => (vibe.mode = d.value)} class="small"
></Toggle> -->
