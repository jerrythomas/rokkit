/**
 * The preset's shortcuts, icon collections and safelist. Pure over a loaded config (and, for
 * the semantic shortcuts, the light Theme).
 */
import { shades, defaultPalette, DEFAULT_ICONS, iconShortcuts, NAMED_TOKENS } from '@rokkit/core'
import { iconCollections } from '@rokkit/core/vite'
import { isColorValue, PALETTE_REF_RE } from './custom-tokens.js'
import { NAMED_SHORTCUT_PREFIXES, buildNamedShortcuts } from './named-shortcuts.js'

const NAMED_TOKEN_SET = new Set(NAMED_TOKENS)

/** Keys of the `icons` config that are settings, not collection names. */
const ICON_SETTINGS = new Set(['collection', 'style', 'overrides'])

/**
 * The icon collections presetIcons loads. `rokkit`, `semantic` and `glyph` are always
 * available, so consumers can reference `i-rokkit:*`, `i-semantic:*`, `i-glyph:*` without
 * declaring them; a consumer entry in `icons` overrides one by name. The `collection`,
 * `style` and `overrides` settings share that object but are not collections.
 * @param {Record<string, unknown>} configIcons
 */
export function iconCollectionsFor(configIcons) {
	const configured = Object.fromEntries(
		Object.entries(configIcons ?? {}).filter(([key]) => !ICON_SETTINGS.has(key))
	)
	return iconCollections({
		rokkit: '@rokkit/icons/ui.json',
		semantic: '@rokkit/icons/semantic.json',
		glyph: '@rokkit/icons/glyph.json',
		...configured
	})
}

/**
 * Classes emitted even when no source uses them: the default icons, the consumer's icon
 * override names (else the shortcut chain's CSS is purged), and every palette background.
 * @param {Record<string, any>} config
 */
export function safelist(config) {
	const overrideNames = Object.keys(config?.icons?.overrides ?? {})
	return [
		...DEFAULT_ICONS,
		...overrideNames,
		...defaultPalette.flatMap((color) => shades.map((shade) => `bg-${color}-${shade}`)),
		...defaultPalette.flatMap((color) => shades.map((shade) => `bg-${color}-${shade}/50`))
	]
}

/**
 * `[name, classes]` for every default icon in the configured collection (`i-semantic` unless
 * `icons.collection` names another), with `icons.overrides` replacing or adding entries.
 * @param {Record<string, any>} config
 */
export function iconShortcutEntries(config) {
	const collection = config.icons?.collection ? `i-${config.icons.collection}` : 'i-semantic'
	const base = iconShortcuts(DEFAULT_ICONS, collection, config.icons?.style)
	return Object.entries({ ...base, ...(config.icons?.overrides ?? {}) })
}

/**
 * Whether a token override resolves to a CSS colour: a palette ref (`'kami.50'`) always does;
 * a raw value is checked with `isColorValue` (oklch / rgb / hsl / hex). A `{ light, dark }`
 * override is judged by its light side, else its dark one.
 */
function isOverrideTokenColor(value) {
	const candidate =
		value !== null && typeof value === 'object' && !Array.isArray(value) ? (value.light ?? value.dark) : value
	if (typeof candidate !== 'string') return false
	return PALETTE_REF_RE.test(candidate) || isColorValue(candidate)
}

/** The colour-meaningful shortcuts for one override token, one per prefix. */
function shortcutsForOverrideToken(name) {
	return (
		NAMED_SHORTCUT_PREFIXES
			// The ring- prefix is reserved for tokens whose name ends in `-ring`.
			.filter(({ prefix }) => prefix !== 'ring' || name.endsWith('-ring'))
			.map(({ prefix, prop }) => [`${prefix}-${name}`, { [prop]: `var(--${name})` }])
	)
}

/**
 * Uno shortcuts for colour-valued override tokens that are NOT reserved named tokens (those
 * already get shortcuts from the named layer).
 * @param {Record<string, any>} config
 */
export function overrideTokenShortcuts(config) {
	/* v8 ignore next — loadConfig always ensures overrides is {} */
	const overrides = config.overrides ?? {}
	return Object.entries(overrides)
		.filter(([name, value]) => !NAMED_TOKEN_SET.has(name) && isOverrideTokenColor(value))
		.flatMap(([name]) => shortcutsForOverrideToken(name))
}

/**
 * Every shortcut, in precedence order: each role's semantic shortcuts, the named-token layer,
 * custom override tokens, then icons.
 */
export function shortcuts(theme, colormap, config) {
	return [
		...Object.keys(colormap).flatMap((variant) => theme.getShortcuts(variant)),
		...buildNamedShortcuts(),
		...overrideTokenShortcuts(config),
		...iconShortcutEntries(config)
	]
}
