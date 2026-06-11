<script lang="ts">
	import { vibe } from '@rokkit/states'
	import { Toggle } from '@rokkit/ui'
	import { buildSkinSwitcherOptions } from '../types/skin-switcher.js'

	let {
		skins = undefined,
		labels = {},
		showLabels = false,
		size = 'sm',
		disabled = false,
		class: className = '',
		onchange
	}: {
		skins?: Array<string | { name: string; label?: string; icon?: string }>
		labels?: Record<string, string>
		showLabels?: boolean
		size?: 'sm' | 'md' | 'lg'
		disabled?: boolean
		class?: string
		onchange?: (skin: string) => void
	} = $props()

	const options = $derived(buildSkinSwitcherOptions(skins ?? vibe.allowedSkins, labels))
	let value = $derived(vibe.skin)

	function handleChange(newValue: unknown) {
		vibe.skin = newValue as string
		onchange?.(newValue as string)
	}
</script>

<Toggle
	variant="group"
	{options}
	{value}
	onchange={handleChange}
	{showLabels}
	{size}
	{disabled}
	class={className}
/>
