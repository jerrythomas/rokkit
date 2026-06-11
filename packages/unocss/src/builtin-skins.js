import { DEFAULT_THEME_MAPPING } from '@rokkit/core'

/**
 * Curated built-in skins (role → Tailwind palette). All palettes exist in
 * @rokkit/core defaultColors, so `data-skin` works with no extra config.
 *
 * `default` is bound to DEFAULT_THEME_MAPPING so the `[data-skin='default']`
 * block (when emitted) and the `:root` preflight resolve to the SAME named
 * tokens. The named skins reuse the same role vocabulary
 * (surface / ink / primary / accent) as DEFAULT_THEME_MAPPING.
 *
 * Consumer `skins` in rokkit.config.js merge on top and can override these.
 */
export const BUILTIN_SKINS = {
	default: { ...DEFAULT_THEME_MAPPING },
	ocean: { surface: 'slate', ink: 'slate', primary: 'sky', accent: 'teal' },
	violet: { surface: 'zinc', ink: 'zinc', primary: 'violet', accent: 'indigo' },
	rose: { surface: 'stone', ink: 'stone', primary: 'rose', accent: 'orange' },
	emerald: { surface: 'slate', ink: 'slate', primary: 'emerald', accent: 'cyan' }
}
