import { NAMED_TOKENS } from '@rokkit/core'

/**
 * Prefix → CSS property pairs for auto-emitted named-token shortcuts.
 * `bg` uses `background-color` (not the shorthand) to avoid clobbering
 * `background-image` / `background-size` on the same element.
 */
export const NAMED_SHORTCUT_PREFIXES = [
	{ prefix: 'bg', prop: 'background-color' },
	{ prefix: 'text', prop: 'color' },
	{ prefix: 'border', prop: 'border-color' },
	{ prefix: 'border-t', prop: 'border-top-color' },
	{ prefix: 'border-b', prop: 'border-bottom-color' },
	{ prefix: 'border-l', prop: 'border-left-color' },
	{ prefix: 'border-r', prop: 'border-right-color' },
	{ prefix: 'ring', prop: '--un-ring-color' },
	{ prefix: 'fill', prop: 'fill' },
	{ prefix: 'stroke', prop: 'stroke' }
]

/**
 * Returns true when the named token should emit a shortcut for the given prefix.
 * - `on-primary` → text-only (it's a contrast color, not a fill)
 * - `focus-ring` → ring and border prefixes only (focus uses outline/ring styles)
 * - `shadow-tint` → no shortcuts (used in box-shadow expressions only)
 */
export function shouldEmitShortcut(name, prefix) {
	if (name === 'shadow-tint') return false
	if (name === 'on-primary') return prefix === 'text'
	if (name === 'focus-ring') return prefix === 'ring' || prefix.startsWith('border')
	return true
}

/**
 * Auto-emit Uno shortcuts for every named token, expanding to a CSS-properties
 * object like `{ 'background-color': 'var(--paper)' }`.
 *
 * Used by both `presetRokkit` (app-side) and `@rokkit/themes/build.mjs`
 * (themes-build pipeline) so authors can `@apply bg-paper-mute` consistently.
 */
export function buildNamedShortcuts() {
	const shortcuts = []
	for (const name of NAMED_TOKENS) {
		for (const { prefix, prop } of NAMED_SHORTCUT_PREFIXES) {
			if (!shouldEmitShortcut(name, prefix)) continue
			shortcuts.push([`${prefix}-${name}`, { [prop]: `var(--${name})` }])
		}
	}
	return shortcuts
}
