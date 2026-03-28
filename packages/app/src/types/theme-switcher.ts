/**
 * ThemeSwitcherToggle Types
 *
 * Types and defaults for the theme mode switcher component.
 */

import type { ToggleItemSnippet } from '@rokkit/ui'
import { DEFAULT_STATE_ICONS } from '@rokkit/core'
import { messages } from '@rokkit/states'
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
	system: DEFAULT_STATE_ICONS.mode.system,
	light: DEFAULT_STATE_ICONS.mode.light,
	dark: DEFAULT_STATE_ICONS.mode.dark
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

export interface ThemeSwitcherLabels {
	system?: string
	light?: string
	dark?: string
}

/**
 * Build toggle options from icons, modes, and labels
 */
export function buildThemeSwitcherOptions(
	icons: Required<ThemeSwitcherIcons>,
	modes: ColorMode[],
	labels: ThemeSwitcherLabels = {}
): ThemeSwitcherOption[] {
	const mergedLabels = { ...messages.mode, ...labels }
	const all: ThemeSwitcherOption[] = [
		{ value: 'system', text: mergedLabels.system, icon: icons.system },
		{ value: 'light', text: mergedLabels.light, icon: icons.light },
		{ value: 'dark', text: mergedLabels.dark, icon: icons.dark }
	]
	return all.filter((o) => modes.includes(o.value))
}

// =============================================================================
// Component Props
// =============================================================================

export interface ThemeSwitcherToggleProps {
	/** Which modes to show. Default: ['system', 'light', 'dark'] */
	modes?: ColorMode[]

	/** Whether to include system mode. Default: true. Shortcut for filtering 'system' from modes. */
	includeSystem?: boolean

	/** Override icons per mode */
	icons?: ThemeSwitcherIcons

	/** Override labels per mode. Merged over messages.mode */
	labels?: ThemeSwitcherLabels

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
