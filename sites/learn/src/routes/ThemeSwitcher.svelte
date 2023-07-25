<script>
	import { theme } from '@rokkit/stores'
	import { defaultStateIcons } from '@rokkit/core'
	import { Select } from '@rokkit/organisms'
	import { Icon } from '@rokkit/atoms'
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
		// if (!document.startViewTransition)
		// 	document.startViewTransition = (fn) => fn()
		// document.startViewTransition(() => theme.set({ ...current, mode }))
	}

	function handleThemeChange(event) {
		theme.set({ ...current, name: event.detail.name })
	}
</script>

<Select
	options={themes}
	value={currentTheme}
	fields={{ text: 'title', value: 'name' }}
	on:select={handleThemeChange}
/>
<theme-mode
	role="switch"
	aria-checked={current.mode === 'dark'}
	class="flex p-0"
>
	<Icon name={modeIcons[current.mode]} role="button" on:click={toggleMode} />
</theme-mode>
