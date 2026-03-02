import type { Snippet } from 'svelte'
import type { ColorRole, Shades } from '../utils/palette.js'

/**
 * Configuration for a complete color palette
 */
export interface PaletteConfig {
	/** Name of the palette (e.g., "Vibrant", "Ocean", "Custom 1") */
	name: string
	/** Mapping of color roles to Tailwind color names or hex values */
	mapping: Partial<Record<ColorRole, string>>
}

/**
 * A preset palette (built-in)
 */
export interface PalettePreset {
	/** Display name */
	name: string
	/** Tailwind color name */
	color: string
	/** Preview hex color (usually the 500 shade) */
	preview: string
}

/**
 * Icons for the PaletteManager component
 */
export interface PaletteManagerIcons {
	/** Icon for the save button */
	save?: string
	/** Icon for the apply/check button */
	check?: string
	/** Icon for the presets toggle */
	presets?: string
	/** Icon for the hex input toggle */
	hex?: string
}

/**
 * Props for the PaletteManager component
 */
export interface PaletteManagerProps {
	/** Current palette configuration (bindable) */
	value?: PaletteConfig

	/** Built-in preset palettes */
	presets?: PalettePreset[]

	/** User-saved custom palettes */
	custom?: PaletteConfig[]

	/** localStorage key for persistence */
	storageKey?: string

	/** Roles to show in the editor */
	roles?: ColorRole[]

	/** Custom icons */
	icons?: PaletteManagerIcons

	/** Auto-apply changes in real-time */
	autoApply?: boolean

	/** Show preset selector */
	showPresets?: boolean

	/** Show save button */
	showSave?: boolean

	/** Compact mode (fewer controls) */
	compact?: boolean

	/** Additional CSS classes */
	class?: string

	/** Called when palette changes */
	onchange?: (palette: PaletteConfig) => void

	/** Called when user saves a custom palette */
	onsave?: (palette: PaletteConfig) => void

	/** Called when palette is applied */
	onapply?: (palette: PaletteConfig) => void

	/** Custom snippet for rendering a color role row */
	roleRow?: PaletteRoleRowSnippet
}

/**
 * Handlers passed to custom role row snippet
 */
export interface PaletteRoleRowHandlers {
	onColorChange: (color: string) => void
	onHexInput: (hex: string) => void
}

/**
 * Custom snippet for rendering a palette role row
 */
export type PaletteRoleRowSnippet = Snippet<
	[role: ColorRole, currentColor: string, shades: Shades, handlers: PaletteRoleRowHandlers]
>

/**
 * Default color roles to display
 */
export const defaultRoles: ColorRole[] = [
	'primary',
	'secondary',
	'accent',
	'surface',
	'success',
	'warning',
	'danger',
	'info'
]

/**
 * Default palette presets using Tailwind colors
 */
export const defaultPresets: PalettePreset[] = [
	{ name: 'Slate', color: 'slate', preview: '#64748b' },
	{ name: 'Gray', color: 'gray', preview: '#6b7280' },
	{ name: 'Zinc', color: 'zinc', preview: '#71717a' },
	{ name: 'Red', color: 'red', preview: '#ef4444' },
	{ name: 'Orange', color: 'orange', preview: '#f97316' },
	{ name: 'Amber', color: 'amber', preview: '#f59e0b' },
	{ name: 'Yellow', color: 'yellow', preview: '#eab308' },
	{ name: 'Lime', color: 'lime', preview: '#84cc16' },
	{ name: 'Green', color: 'green', preview: '#22c55e' },
	{ name: 'Emerald', color: 'emerald', preview: '#10b981' },
	{ name: 'Teal', color: 'teal', preview: '#14b8a6' },
	{ name: 'Cyan', color: 'cyan', preview: '#06b6d4' },
	{ name: 'Sky', color: 'sky', preview: '#0ea5e9' },
	{ name: 'Blue', color: 'blue', preview: '#3b82f6' },
	{ name: 'Indigo', color: 'indigo', preview: '#6366f1' },
	{ name: 'Violet', color: 'violet', preview: '#8b5cf6' },
	{ name: 'Purple', color: 'purple', preview: '#a855f7' },
	{ name: 'Fuchsia', color: 'fuchsia', preview: '#d946ef' },
	{ name: 'Pink', color: 'pink', preview: '#ec4899' },
	{ name: 'Rose', color: 'rose', preview: '#f43f5e' }
]

/**
 * Default palette configuration
 */
export const defaultPaletteConfig: PaletteConfig = {
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
}
