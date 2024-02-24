<script>
	import { theme } from '@rokkit/stores'
	import { Select, ToggleThemeMode } from '@rokkit/ui'

	export let themes = [
		{ title: 'Rokkit', name: 'rokkit' },
		{ title: 'Minimal', name: 'minimal' },
		{ title: 'Material', name: 'material' }
	]

	let currentTheme
	$: currentTheme = themes.find(({ name }) => name === $theme.name)

	function handleThemeChange(event) {
		theme.update((current) => ({ ...current, name: event.detail.name }))
	}
</script>

<Select
	name="theme"
	options={themes}
	value={currentTheme}
	fields={{ text: 'title', value: 'name' }}
	on:select={handleThemeChange}
/>
<ToggleThemeMode />
