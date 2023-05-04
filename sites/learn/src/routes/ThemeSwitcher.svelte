<script>
	import { theme } from '@rokkit/core/stores'
	import { defaultStateIcons } from '@rokkit/core'
	import { Select } from '@rokkit/input'

	const modeIcons = defaultStateIcons.mode

	export let themes = [
		{ title: 'Rokkit', name: 'rokkit' },
		{ title: 'Minimal', name: 'minimal' },
		{ title: 'Material', name: 'material' }
	]

	let currentTheme

	$: current = $theme
	$: currentTheme = themes.find((theme) => theme.name === current.name)

	function toggleMode() {
		const mode = current.mode === 'dark' ? 'light' : 'dark'
		theme.set({ ...current, mode })
	}
	function handleKeyDown(event) {
		if (['Enter', ' '].includes(event.key)) {
			toggleMode()
		}
	}
	function handleThemeChange(event) {
		theme.set({ ...current, name: event.detail.name })
	}
</script>

<Select
	items={themes}
	value={currentTheme}
	fields={{ text: 'title', id: 'name' }}
	on:select={handleThemeChange}
/>
<theme-mode
	role="switch"
	aria-checked={current.mode === 'dark'}
	class="flex select-none cursor-pointer"
	tabindex="0"
	on:click={toggleMode}
	on:keydown={handleKeyDown}
>
	<icon class={modeIcons[current.mode]} />
</theme-mode>
