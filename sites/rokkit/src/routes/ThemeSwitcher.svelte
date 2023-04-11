<script>
	import { theme } from '@rokkit/core/stores'
	import { defaultStateIcons } from '@rokkit/core'
	import { toInitCapCase } from '@rokkit/utils'
	import { Select } from '@rokkit/input'

	export let themes = [
		{ title: 'Rokkit', name: 'rokkit' },
		{ title: 'Material', name: 'material' },
		{ title: 'Minimal', name: 'minimal' }
	]
	// export let pallettes

	const modeIcons = defaultStateIcons.mode

	let currentTheme

	// $: current = { theme: 'rokkit', mode: 'dark' }
	// $: themes = fromInput(themes)
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
		console.log('Theme changed', event.detail)
		theme.set({ ...current, name: event.detail.name })
	}

	$: console.log('current', current)
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
