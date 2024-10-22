<script>
	import { theme } from '@rokkit/stores'
	import { Select, ToggleThemeMode } from '@rokkit/ui'

	let { themes = [
		{ title: 'Rokkit', name: 'rokkit' },
		{ title: 'Minimal', name: 'minimal' },
		{ title: 'Material', name: 'material' }
	] } = $props();

	let currentTheme = $derived(themes.find(({ name }) => name === $theme.name))
	

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
