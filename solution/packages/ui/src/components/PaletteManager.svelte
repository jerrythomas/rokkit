<script lang="ts">
	import type { PaletteManagerProps, PaletteConfig, PaletteManagerIcons } from '../types/palette.js'
	import { defaultRoles, defaultPresets, defaultPaletteConfig } from '../types/palette.js'
	import { DEFAULT_STATE_ICONS } from '@rokkit/core'
	import type { ColorRole, Shades } from '../utils/palette.js'
	import {
		getShades,
		applyPalette,
		savePalette,
		loadPalette,
		isHexColor,
		getTailwindColorNames
	} from '../utils/palette.js'

	let {
		value = $bindable<PaletteConfig>(structuredClone(defaultPaletteConfig)),
		presets = defaultPresets,
		custom = $bindable<PaletteConfig[]>([]),
		storageKey,
		roles = defaultRoles,
		icons: userIcons = {} as PaletteManagerIcons,
		autoApply = true,
		showPresets = true,
		showSave = true,
		compact = false,
		class: className = '',
		onchange,
		onsave,
		onapply,
		roleRow: roleRowSnippet
	}: PaletteManagerProps = $props()

	const icons = $derived({
		save: DEFAULT_STATE_ICONS.action.save,
		check: DEFAULT_STATE_ICONS.action.check,
		presets: DEFAULT_STATE_ICONS.palette.presets,
		hex: DEFAULT_STATE_ICONS.palette.hex,
		...userIcons
	})

	// Available Tailwind colors for the select dropdown
	const tailwindColorNames = getTailwindColorNames()

	// Track hex input values for each role (for custom hex entry)
	let hexInputs = $state<Record<string, string>>({})

	// Track which role has hex input visible
	let showHexInput = $state<Record<string, boolean>>({})

	// Computed shades for each role
	const roleShades = $derived.by(() => {
		const shades: Record<string, Shades> = {}
		for (const role of roles) {
			const color = value?.mapping[role]
			if (color) {
				try {
					shades[role] = getShades(color)
				} catch {
					// Invalid color, use a fallback
					shades[role] = getShades('gray')
				}
			}
		}
		return shades
	})

	// Load saved palette on mount
	$effect(() => {
		if (storageKey) {
			const saved = loadPalette(storageKey)
			if (saved) {
				value = { name: 'Saved', mapping: saved }
				if (autoApply) {
					applyPalette(saved)
				}
			}
		}
	})

	/**
	 * Update a role's color
	 */
	function updateRoleColor(role: ColorRole, color: string) {
		if (!value) {
			value = structuredClone(defaultPaletteConfig)
		}
		value = {
			...value,
			mapping: {
				...value.mapping,
				[role]: color
			}
		}
		onchange?.(value)
		if (autoApply) {
			applyPalette(value.mapping)
		}
	}

	/**
	 * Handle select change for a role
	 */
	function handleSelectChange(role: ColorRole, event: Event) {
		const select = event.target as HTMLSelectElement
		const color = select.value
		if (color) {
			updateRoleColor(role, color)
		}
	}

	/**
	 * Handle hex input change
	 */
	function handleHexInput(role: ColorRole, event: Event) {
		const input = event.target as HTMLInputElement
		let hex = input.value.trim()

		// Add # if missing
		if (hex && !hex.startsWith('#')) {
			hex = `#${  hex}`
		}

		hexInputs[role] = hex

		// Only update if valid hex
		if (isHexColor(hex)) {
			updateRoleColor(role, hex)
		}
	}

	/**
	 * Toggle hex input visibility for a role
	 */
	function toggleHexInput(role: ColorRole) {
		showHexInput[role] = !showHexInput[role]
		if (showHexInput[role]) {
			// Initialize hex input with current color if it's a hex
			const current = value?.mapping[role]
			if (current && isHexColor(current)) {
				hexInputs[role] = current
			} else {
				hexInputs[role] = ''
			}
		}
	}

	/**
	 * Apply the current palette
	 */
	function handleApply() {
		if (value) {
			applyPalette(value.mapping)
			if (storageKey) {
				savePalette(storageKey, value.mapping)
			}
			onapply?.(value)
		}
	}

	/**
	 * Save current palette as custom
	 */
	function handleSave() {
		if (!value) return

		const name = prompt('Enter a name for this palette:', value.name || 'Custom Palette')
		if (!name) return

		const newPalette: PaletteConfig = {
			name,
			mapping: { ...value.mapping }
		}

		custom = [...custom, newPalette]
		onsave?.(newPalette)
	}

	/**
	 * Load a preset palette
	 */
	function loadPreset(preset: { name: string; color: string }) {
		value = {
			name: preset.name,
			mapping: {
				...value?.mapping,
				primary: preset.color
			}
		}
		onchange?.(value)
		if (autoApply) {
			applyPalette(value.mapping)
		}
	}

	/**
	 * Load a custom palette
	 */
	function loadCustomPalette(palette: PaletteConfig) {
		value = structuredClone(palette)
		onchange?.(value)
		if (autoApply) {
			applyPalette(value.mapping)
		}
	}

	/**
	 * Get the current color for a role
	 */
	function getRoleColor(role: ColorRole): string {
		return value?.mapping[role] || ''
	}

	/**
	 * Check if current color is a Tailwind preset
	 */
	function isTailwindColor(color: string): boolean {
		return tailwindColorNames.includes(color.toLowerCase())
	}
</script>

{#snippet shadePreview(shades: Shades)}
	<div data-palette-shades>
		{#each Object.entries(shades) as [shade, hex] (shade)}
			<div
				data-palette-shade
				data-shade={shade}
				style="background-color: {hex}"
				title="{shade}: {hex}"
			></div>
		{/each}
	</div>
{/snippet}

{#snippet defaultRoleRow(role: ColorRole, currentColor: string, shades: Shades)}
	<div data-palette-role data-role={role}>
		<label data-palette-role-label for="palette-{role}">
			{role.charAt(0).toUpperCase() + role.slice(1)}
		</label>

		<div data-palette-role-controls>
			{#if !showHexInput[role]}
				<select
					id="palette-{role}"
					data-palette-color-select
					value={isTailwindColor(currentColor) ? currentColor : ''}
					onchange={(e) => handleSelectChange(role, e)}
				>
					<option value="" disabled>Select color...</option>
					{#each tailwindColorNames as color (color)}
						<option value={color}>{color.charAt(0).toUpperCase() + color.slice(1)}</option>
					{/each}
				</select>
			{:else}
				<input
					type="text"
					data-palette-color-input
					placeholder="#000000"
					value={hexInputs[role] || ''}
					oninput={(e) => handleHexInput(role, e)}
				/>
			{/if}

			<button
				type="button"
				data-palette-hex-toggle
				onclick={() => toggleHexInput(role)}
				title={showHexInput[role] ? 'Select from presets' : 'Enter custom hex'}
			>
				{#if showHexInput[role]}
					<span data-palette-presets-icon class={icons.presets} aria-hidden="true"></span>
				{:else}
					<span data-palette-hex-icon class={icons.hex} aria-hidden="true"></span>
				{/if}
			</button>
		</div>

		{@render shadePreview(shades)}
	</div>
{/snippet}

<div
	data-palette-manager
	data-compact={compact || undefined}
	class={className || undefined}
>
	{#if showPresets && presets.length > 0}
		<div data-palette-presets>
			<span data-palette-presets-label>Presets</span>
			<div data-palette-presets-list>
				{#each presets as preset (preset.color)}
					<button
						type="button"
						data-palette-preset
						data-active={value?.mapping.primary === preset.color || undefined}
						style="--preset-color: {preset.preview}"
						onclick={() => loadPreset(preset)}
						title={preset.name}
					>
						<span data-palette-preset-swatch></span>
						{#if !compact}
							<span data-palette-preset-name>{preset.name}</span>
						{/if}
					</button>
				{/each}
			</div>
		</div>
	{/if}

	{#if custom.length > 0}
		<div data-palette-custom>
			<span data-palette-custom-label>Custom Palettes</span>
			<div data-palette-custom-list>
				{#each custom as palette (palette.name)}
					<button
						type="button"
						data-palette-custom-item
						data-active={value?.name === palette.name || undefined}
						onclick={() => loadCustomPalette(palette)}
					>
						{palette.name}
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<div data-palette-editor>
		{#each roles as role (role)}
			{@const currentColor = getRoleColor(role)}
			{@const shades = roleShades[role]}
			{#if shades}
				{#if roleRowSnippet}
					{@render roleRowSnippet(role, currentColor, shades, {
						onColorChange: (color) => updateRoleColor(role, color),
						onHexInput: (hex) => {
							hexInputs[role] = hex
							if (isHexColor(hex)) {
								updateRoleColor(role, hex)
							}
						}
					})}
				{:else}
					{@render defaultRoleRow(role, currentColor, shades)}
				{/if}
			{/if}
		{/each}
	</div>

	<div data-palette-actions>
		{#if showSave}
			<button type="button" data-palette-save onclick={handleSave}>
				<span data-palette-save-icon class={icons.save} aria-hidden="true"></span>
				Save as Custom
			</button>
		{/if}

		{#if !autoApply}
			<button type="button" data-palette-apply onclick={handleApply}>
				<span data-palette-check-icon class={icons.check} aria-hidden="true"></span>
				Apply
			</button>
		{/if}
	</div>
</div>
