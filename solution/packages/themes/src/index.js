import { Theme } from '@rokkit/core'

export {
	Theme,
	themeRules,
	shadesOf,
	semanticShortcuts,
	contrastShortcuts,
	iconShortcuts,
	DEFAULT_ICONS,
	DEFAULT_THEME_MAPPING,
	defaultColors
} from '@rokkit/core'

/**
 * Generates a UnoCSS `theme.colors` object mapping semantic variant names
 * to CSS variable-backed color scales.
 *
 * @param {Object} [mapping] - Override the default theme variant→color mapping.
 * @param {Object} [colors]  - Override the default color palette.
 * @returns {Object} UnoCSS theme colors object.
 */
export function themeColors(mapping, colors) {
	return new Theme({ mapping, colors }).getColorRules()
}
