<script>
	// @ts-nocheck
	import { List, Select } from '@rokkit/ui'
	import { defaultRoles } from '@rokkit/ui'
	import { getShades, getTailwindColorNames, tailwindColors } from '@rokkit/ui'
	import PlaySection from '$lib/components/PlaySection.svelte'

	// Predefined palette groups — each is a complete role-to-color mapping
	const palettes = [
		{
			name: 'Default',
			mapping: {
				primary: 'orange',
				secondary: 'pink',
				accent: 'sky',
				surface: 'slate',
				success: 'green',
				warning: 'amber',
				danger: 'red',
				info: 'cyan'
			}
		},
		{
			name: 'Vibrant',
			mapping: {
				primary: 'orange',
				secondary: 'fuchsia',
				accent: 'cyan',
				surface: 'stone',
				success: 'emerald',
				warning: 'yellow',
				danger: 'rose',
				info: 'sky'
			}
		},
		{
			name: 'Ocean',
			mapping: {
				primary: 'teal',
				secondary: 'blue',
				accent: 'cyan',
				surface: 'slate',
				success: 'emerald',
				warning: 'amber',
				danger: 'red',
				info: 'sky'
			}
		},
		{
			name: 'Forest',
			mapping: {
				primary: 'emerald',
				secondary: 'lime',
				accent: 'teal',
				surface: 'stone',
				success: 'green',
				warning: 'yellow',
				danger: 'orange',
				info: 'cyan'
			}
		},
		{
			name: 'Sunset',
			mapping: {
				primary: 'rose',
				secondary: 'orange',
				accent: 'amber',
				surface: 'neutral',
				success: 'emerald',
				warning: 'yellow',
				danger: 'red',
				info: 'sky'
			}
		},
		{
			name: 'Midnight',
			mapping: {
				primary: 'indigo',
				secondary: 'violet',
				accent: 'blue',
				surface: 'zinc',
				success: 'emerald',
				warning: 'amber',
				danger: 'rose',
				info: 'cyan'
			}
		},
		{
			name: 'Sea Green',
			mapping: {
				primary: 'green',
				secondary: 'blue',
				accent: 'teal',
				surface: 'gray',
				success: 'emerald',
				warning: 'amber',
				danger: 'red',
				info: 'cyan'
			}
		},
		{
			name: 'Berry',
			mapping: {
				primary: 'purple',
				secondary: 'pink',
				accent: 'fuchsia',
				surface: 'zinc',
				success: 'green',
				warning: 'amber',
				danger: 'rose',
				info: 'violet'
			}
		}
	]

	// Build list items for the palette selector
	const paletteItems = palettes.map((p) => ({
		label: p.name,
		value: p.name
	}))

	// Build Select options for individual color selection
	const tailwindColorNameList = getTailwindColorNames()
	const colorOptions = tailwindColorNameList.map((name) => ({
		label: name.charAt(0).toUpperCase() + name.slice(1),
		value: name
	}))

	// Current active palette config
	let config = $state(structuredClone(palettes[0]))
	let selectedPalette = $state('Default')

	// Computed shades for each role
	const roleShades = $derived.by(() => {
		const result = {}
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

	function handlePaletteSelect(value) {
		const name = String(value)
		selectedPalette = name
		const palette = palettes.find((p) => p.name === name)
		if (palette) {
			config = structuredClone(palette)
		}
	}

	function handleRoleChange(role) {
		return (value) => {
			config = {
				...config,
				mapping: {
					...config.mapping,
					[role]: String(value)
				}
			}
		}
	}

	function getColorLabel(color) {
		if (!color) return 'none'
		return color.charAt(0).toUpperCase() + color.slice(1)
	}

	function getColor500(name) {
		return tailwindColors[name]?.['500'] ?? '#888'
	}
</script>

<PlaySection>
	{#snippet preview()}
		<div class="flex h-full w-full items-stretch gap-4">
			<div class="flex w-[180px] shrink-0 flex-col">
				<h4 class="text-surface-z5 m-0 mb-2 text-xs tracking-wide uppercase">Palettes</h4>
				<div class="bg-surface-z0 border-surface-z2 flex-1 overflow-y-auto rounded-md border">
					<List
						items={paletteItems}
						value={selectedPalette}
						size="sm"
						onselect={handlePaletteSelect}
					>
						{#snippet item(item, _fields, handlers)}
							{@const palette = palettes.find((p) => p.name === item.label)}
							<button
								class="flex items-center gap-2"
								data-list-item
								onclick={handlers.onclick}
								onkeydown={handlers.onkeydown}
							>
								{#if palette}
									<span class="flex shrink-0 gap-px overflow-hidden rounded-sm">
										<span
											class="h-3 w-2"
											style="background-color: {tailwindColors[palette.mapping.primary ?? 'gray'][
												'500'
											]}"
										></span>
										<span
											class="h-3 w-2"
											style="background-color: {tailwindColors[palette.mapping.secondary ?? 'gray'][
												'500'
											]}"
										></span>
									</span>
								{/if}
								<span>{item.label}</span>
							</button>
						{/snippet}
					</List>
				</div>
			</div>

			<div class="min-w-0 flex-1">
				<h4 class="text-surface-z5 m-0 mb-2 text-xs tracking-wide uppercase">Color Mapping</h4>
				<div class="flex flex-col gap-2.5">
					{#each defaultRoles as role}
						{@const shades = roleShades[role]}
						{@const color = config.mapping[role]}
						{#if shades}
							<div class="bg-surface-z0 border-surface-z2 overflow-hidden rounded-md border">
								<div class="flex items-center justify-between px-2 py-1.5">
									<span class="text-surface-z8 text-xs font-semibold capitalize">{role}</span>
									<span class="text-surface-z5 font-mono text-[0.6875rem]"
										>{getColorLabel(color)}</span
									>
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
				<span class="text-surface-z6 text-xs font-medium capitalize">{role}</span>
				<Select
					options={colorOptions}
					value={config.mapping[role]}
					placeholder="Select color..."
					size="sm"
					onchange={handleRoleChange(role)}
				>
					{#snippet item(item, _fields, handlers, _isSelected)}
						<button
							class="flex w-full items-center gap-2"
							onclick={handlers.onclick}
							onkeydown={handlers.onkeydown}
						>
							<span
								class="border-surface-z3 h-3 w-3 shrink-0 rounded-full border"
								style="background-color: {getColor500(String(item.value))}"
							></span>
							<span>{item.label}</span>
						</button>
					{/snippet}
				</Select>
			</div>
		{/each}
	{/snippet}
</PlaySection>
