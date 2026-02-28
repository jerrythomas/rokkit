<script lang="ts">
	import { List, Select } from '@rokkit/ui'
	import type { PaletteConfig, ColorRole, Shades, ListItemHandlers, SelectItemHandlers } from '@rokkit/ui'
	import { defaultRoles } from '@rokkit/ui'
	import { getShades, getTailwindColorNames, tailwindColors } from '@rokkit/ui'
	import Playground from '$lib/Playground.svelte'

	// Predefined palette groups — each is a complete role-to-color mapping
	const palettes: PaletteConfig[] = [
		{
			name: 'Default',
			mapping: { primary: 'orange', secondary: 'pink', accent: 'sky', surface: 'slate', success: 'green', warning: 'amber', danger: 'red', info: 'cyan' }
		},
		{
			name: 'Vibrant',
			mapping: { primary: 'orange', secondary: 'fuchsia', accent: 'cyan', surface: 'stone', success: 'emerald', warning: 'yellow', danger: 'rose', info: 'sky' }
		},
		{
			name: 'Ocean',
			mapping: { primary: 'teal', secondary: 'blue', accent: 'cyan', surface: 'slate', success: 'emerald', warning: 'amber', danger: 'red', info: 'sky' }
		},
		{
			name: 'Forest',
			mapping: { primary: 'emerald', secondary: 'lime', accent: 'teal', surface: 'stone', success: 'green', warning: 'yellow', danger: 'orange', info: 'cyan' }
		},
		{
			name: 'Sunset',
			mapping: { primary: 'rose', secondary: 'orange', accent: 'amber', surface: 'neutral', success: 'emerald', warning: 'yellow', danger: 'red', info: 'sky' }
		},
		{
			name: 'Midnight',
			mapping: { primary: 'indigo', secondary: 'violet', accent: 'blue', surface: 'zinc', success: 'emerald', warning: 'amber', danger: 'rose', info: 'cyan' }
		},
		{
			name: 'Sea Green',
			mapping: { primary: 'green', secondary: 'blue', accent: 'teal', surface: 'gray', success: 'emerald', warning: 'amber', danger: 'red', info: 'cyan' }
		},
		{
			name: 'Berry',
			mapping: { primary: 'purple', secondary: 'pink', accent: 'fuchsia', surface: 'zinc', success: 'green', warning: 'amber', danger: 'rose', info: 'violet' }
		}
	]

	// Build list items for the palette selector
	const paletteItems = palettes.map((p) => ({
		text: p.name,
		value: p.name
	}))

	// Build Select options for individual color selection
	const tailwindColorNameList = getTailwindColorNames()
	const colorOptions = tailwindColorNameList.map((name) => ({
		text: name.charAt(0).toUpperCase() + name.slice(1),
		value: name
	}))

	// Current active palette config
	let config = $state<PaletteConfig>(structuredClone(palettes[0]))
	let selectedPalette = $state<string>('Default')

	// Computed shades for each role
	const roleShades = $derived.by(() => {
		const result: Record<string, Shades> = {}
		for (const role of defaultRoles) {
			const color = config.mapping[role]
			if (color) {
				try {
					result[role] = getShades(color)
				} catch {
					result[role] = getShades('gray')
				}
			}
		}
		return result
	})

	function handlePaletteSelect(value: unknown) {
		const name = String(value)
		selectedPalette = name
		const palette = palettes.find((p) => p.name === name)
		if (palette) {
			config = structuredClone(palette)
		}
	}

	function handleRoleChange(role: ColorRole) {
		return (value: unknown) => {
			config = {
				...config,
				mapping: {
					...config.mapping,
					[role]: String(value)
				}
			}
		}
	}

	function getColorLabel(color: string | undefined): string {
		if (!color) return 'none'
		return color.charAt(0).toUpperCase() + color.slice(1)
	}

	function getColor500(name: string): string {
		return tailwindColors[name]?.['500'] ?? '#888'
	}
</script>

<Playground
	title="PaletteManager"
	description="Interactive color palette editor for managing theme color mappings."
>
	{#snippet preview()}
		<div class="flex gap-4 w-full h-full items-stretch">
			<div class="w-[180px] shrink-0 flex flex-col">
				<h4 class="m-0 mb-2 text-xs text-surface-z5 uppercase tracking-wide">Palettes</h4>
				<div class="flex-1 overflow-y-auto rounded-md bg-surface-z0 border-surface-z2 border">
					<List
						items={paletteItems}
						value={selectedPalette}
						size="sm"
						onselect={handlePaletteSelect}
					>
						{#snippet item(item: Record<string, unknown>, _fields: unknown, handlers: ListItemHandlers)}
							{@const palette = palettes.find((p) => p.name === item.text)}
							<button class="flex items-center gap-2" data-list-item onclick={handlers.onclick} onkeydown={handlers.onkeydown}>
								{#if palette}
									<span class="flex gap-px rounded-sm overflow-hidden shrink-0">
										<span class="w-2 h-3" style="background-color: {tailwindColors[palette.mapping.primary ?? 'gray']['500']}"></span>
										<span class="w-2 h-3" style="background-color: {tailwindColors[palette.mapping.secondary ?? 'gray']['500']}"></span>
									</span>
								{/if}
								<span>{item.text}</span>
							</button>
						{/snippet}
					</List>
				</div>
			</div>

			<div class="flex-1 min-w-0">
				<h4 class="m-0 mb-2 text-xs text-surface-z5 uppercase tracking-wide">Color Mapping</h4>
				<div class="flex flex-col gap-2.5">
					{#each defaultRoles as role}
						{@const shades = roleShades[role]}
						{@const color = config.mapping[role]}
						{#if shades}
							<div class="rounded-md overflow-hidden bg-surface-z0 border-surface-z2 border">
								<div class="flex justify-between items-center py-1.5 px-2">
									<span class="text-xs font-semibold capitalize text-surface-z8">{role}</span>
									<span class="text-[0.6875rem] font-mono text-surface-z5">{getColorLabel(color)}</span>
								</div>
								<div class="flex h-6">
									{#each Object.entries(shades) as [shade, hex]}
										<div
											class="flex-1"
											style="background-color: {hex}"
											title="{role}-{shade}: {hex}"
										></div>
									{/each}
								</div>
							</div>
						{/if}
					{/each}
				</div>
			</div>
		</div>
	{/snippet}

	{#snippet controls()}
		{#each defaultRoles as role}
			<div class="flex flex-col gap-1">
				<label class="text-xs font-medium capitalize text-surface-z6">{role}</label>
				<Select
					options={colorOptions}
					value={config.mapping[role]}
					placeholder="Select color..."
					size="sm"
					onchange={handleRoleChange(role)}
				>
					{#snippet item(item: Record<string, unknown>, _fields: unknown, handlers: SelectItemHandlers, _isSelected: boolean)}
						<button class="flex items-center gap-2 w-full" onclick={handlers.onclick} onkeydown={handlers.onkeydown}>
							<span class="w-3 h-3 rounded-full shrink-0 border border-surface-z3" style="background-color: {getColor500(String(item.value))}"></span>
							<span>{item.text}</span>
						</button>
					{/snippet}
				</Select>
			</div>
		{/each}
	{/snippet}
</Playground>
