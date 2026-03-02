<script lang="ts">
	import { onMount } from 'svelte'
	import { vibe } from '@rokkit/states'
	import { Toggle } from '@rokkit/ui'
	import type { ThemeSwitcherToggleProps } from '../types/theme-switcher.js'
	import {
		defaultThemeSwitcherIcons,
		buildThemeSwitcherOptions
	} from '../types/theme-switcher.js'
	import { ColorModeManager, type ColorMode } from '../utils/color-mode.svelte.js'

	let {
		modes = ['system', 'light', 'dark'],
		icons: userIcons,
		labels: userLabels = {},
		showLabels = false,
		size = 'sm',
		disabled = false,
		class: className = '',
		item: itemSnippet,
		onchange
	}: ThemeSwitcherToggleProps = $props()

	const icons = $derived({ ...defaultThemeSwitcherIcons, ...userIcons })
	const options = $derived(buildThemeSwitcherOptions(icons, modes, userLabels))

	const manager = new ColorModeManager(vibe)
	let value = $derived(manager.mode)

	onMount(() => {
		return manager.listen()
	})

	function handleChange(newValue: unknown) {
		const mode = newValue as ColorMode
		manager.mode = mode
		onchange?.(mode)
	}
</script>

<Toggle
	{options}
	{value}
	onchange={handleChange}
	{showLabels}
	{size}
	{disabled}
	class={className}
	item={itemSnippet}
/>
