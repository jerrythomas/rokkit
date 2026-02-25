/**
 * ThemeSwitcherToggle Types
 *
 * Types and defaults for the theme mode switcher component.
 */

import type { ToggleItemSnippet } from '@rokkit/ui'
import { defaultStateIcons } from '@rokkit/core'
import type { ColorMode } from '../utils/color-mode.svelte.js'

// =============================================================================
// Icons
// =============================================================================

export interface ThemeSwitcherIcons {
	system?: string
	light?: string
	dark?: string
}

export const defaultThemeSwitcherIcons: Required<ThemeSwitcherIcons> = {
	system: 'i-lucide:monitor',
	light: defaultStateIcons.mode.light,
	dark: defaultStateIcons.mode.dark
}

// =============================================================================
// Options
// =============================================================================

export interface ThemeSwitcherOption {
	value: ColorMode
	text: string
	icon: string
	[key: string]: unknown
}

/**
 * Build toggle options from icons and requested modes
 */
export function buildThemeSwitcherOptions(
	icons: Required<ThemeSwitcherIcons>,
	modes: ColorMode[]
): ThemeSwitcherOption[] {
	const all: ThemeSwitcherOption[] = [
		{ value: 'system', text: 'System', icon: icons.system },
		{ value: 'light', text: 'Light', icon: icons.light },
		{ value: 'dark', text: 'Dark', icon: icons.dark }
	]
	return all.filter((o) => modes.includes(o.value))
}

// =============================================================================
// Component Props
// =============================================================================

export interface ThemeSwitcherToggleProps {
	/** Which modes to show. Default: ['system', 'light', 'dark'] */
	modes?: ColorMode[]

	/** Override icons per mode */
	icons?: ThemeSwitcherIcons

	/** Show text labels alongside icons. Default: false */
	showLabels?: boolean

	/** Size variant. Default: 'sm' */
	size?: 'sm' | 'md' | 'lg'

	/** Disabled state */
	disabled?: boolean

	/** Additional CSS classes */
	class?: string

	/** Custom snippet for rendering toggle items */
	item?: ToggleItemSnippet

	/** Called when mode changes */
	onchange?: (mode: ColorMode) => void
}
