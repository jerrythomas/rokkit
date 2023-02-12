<script>
	import { theme } from '@rokkit/core/stores'
	import { defaultStateIcons } from '@rokkit/core'
	import { toInitCapCase } from '@rokkit/utils'
	import { DropDown } from '@rokkit/core'

	// export let themes = [{ title: 'Rokkit', name: 'rokkit' }]
	// export let pallettes

	const modeIcons = defaultStateIcons.mode

	// let currentTheme

	// $: current = { theme: 'rokkit', mode: 'dark' }
	// $: themes = fromInput(themes)
	$: current = $theme

	// function fromInput(themes) {
	// 	if (Array.isArray(themes)) {
	// 		return themes.map((x) =>
	// 			typeof x == 'string'
	// 				? { title: toInitCapCase(x), name: x.toLowerCase() }
	// 				: x
	// 		)
	// 	} else {
	// 		return [{ title: 'Rokkit', name: 'rokkit' }]
	// 	}
	// }
	function toggleMode() {
		const mode = current.mode === 'dark' ? 'light' : 'dark'
		theme.set({ ...current, mode })
	}
	function handleKeyDown(event) {
		if (['Enter', ' '].includes(event.key)) {
			toggleMode()
		}
	}
</script>

<!-- <DropDown
	items={themes}
	bind:value={currentTheme}
	fields={{ text: 'title', id: 'name' }}
/> -->
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
