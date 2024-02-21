<script>
	import { theme } from '@rokkit/stores'
	import { defaultStateIcons } from '@rokkit/core'
	import { Select } from '@rokkit/organisms'
	import { ToggleThemeMode } from '@rokkit/layout'
	// import { Icon } from '@rokkit/atoms'
	// const modeIcons = defaultStateIcons.mode

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
<!-- <theme-mode role="switch" aria-checked={current.mode === 'dark'} class="flex p-0">
	<Icon
		name={modeIcons[current.mode]}
		role="button"
		on:click={toggleMode}
		class="border border-neutral-muted rounded"
	/>
</theme-mode> -->
