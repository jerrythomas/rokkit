/**
 * Skin definitions and runtime color-role switching for the Sensei demo app.
 *
 * Provides predefined skins (from rokkit.config.js), a list of available palettes,
 * and helpers to apply skin or individual role overrides at runtime by setting
 * CSS custom properties on the document root.
 */

import { defaultColors, shades } from '@rokkit/core'
import { ColorSpace, relativeLuminance, pickOnColor } from '@rokkit/core'
import { NAMED_TOKENS, NAMED_TOKEN_SHADE_MAP, NAMED_TOKEN_ROLE_MAP } from '@rokkit/core'
import { PALETTE_FAMILIES } from '@rokkit/unocss/palettes'

// ── Custom OKLCH palettes: rokkit's palette families, as rokkit.config.js uses them ──

const customPalettes: Record<string, Record<number, string>> = Object.assign(
	{},
	...Object.values(PALETTE_FAMILIES).map((family) => family.palettes)
)

// ── OKLCH adapter for wrapping values ───────────────────────────────────────

const oklchAdapter = ColorSpace.create('oklch')

// ── Skin definitions ────────────────────────────────────────────────────────

interface SkinDefinition {
	name: string
	label: string
	surface: string
	darkSurface?: string
	ink: string
	primary: string
	secondary: string
	accent: string
}

/**
 * A skin role can map to a single palette name (same in light + dark) or
 * a dual-palette object `{ light, dark }` that swaps based on data-mode.
 */
type RoleMapping = string | { light: string; dark: string }

/** A role's palette on light paper — the one a swatch shows. */
const lightSide = (mapping: RoleMapping) => (typeof mapping === 'string' ? mapping : mapping.light)
/** `sea-glass` → `Sea Glass`. */
const titleOf = (name: string) => name.replace(/(^|-)(\w)/g, (_, sep, c) => `${sep ? ' ' : ''}${c.toUpperCase()}`)

/**
 * The palette families as switchable skins, in rokkit.config.js's order. zen-sumi is the
 * `default` skin (its tokens are the `:root` ones); the rest keep their family names.
 */
export const skinDefinitions: SkinDefinition[] = Object.values(PALETTE_FAMILIES).map(({ name, skin }) => {
	const surface = skin.surface as RoleMapping
	return {
		name: name === 'zen-sumi' ? 'default' : name,
		label: titleOf(name),
		surface: lightSide(surface),
		darkSurface: typeof surface === 'string' ? undefined : surface.dark,
		ink: lightSide(skin.ink as RoleMapping),
		primary: lightSide(skin.primary as RoleMapping),
		secondary: lightSide(skin.secondary as RoleMapping),
		accent: lightSide(skin.accent as RoleMapping)
	}
})

// ── Tailwind palette names available for individual role picking ─────────

const tailwindPaletteNames = [
	'slate', 'zinc', 'stone',
	'sky', 'teal', 'cyan',
	'violet', 'purple', 'indigo',
	'rose', 'pink', 'orange',
	'emerald', 'blue', 'amber', 'green', 'red',
]

const customPaletteNames = Object.keys(customPalettes)

/** All available palettes for individual role picking */
export const availablePalettes: string[] = [...customPaletteNames, ...tailwindPaletteNames]

// ── Palette value helpers ───────────────────────────────────────────────────

/**
 * A built-in palette by name, or null. preset-mini's colour map also holds keyword entries
 * (`inherit`, `current`…) that are plain strings, so an entry is only a palette if it is an
 * object — narrowed here rather than cast.
 */
function builtinPalette(name: string): Record<string | number, string> | null {
	const entry = (defaultColors as Record<string, unknown>)[name]
	return entry !== null && typeof entry === 'object' ? (entry as Record<string | number, string>) : null
}

function isCustomPalette(name: string): boolean {
	return name in customPalettes
}

/**
 * Get the raw shade values for a palette (all shades).
 * Returns values as CSS-ready strings.
 */
function getPaletteShades(paletteName: string): Record<number, string> | null {
	if (isCustomPalette(paletteName)) {
		return customPalettes[paletteName]
	}
	const tw = builtinPalette(paletteName)
	if (!tw) return null
	const result: Record<number, string> = {}
	for (const shade of shades) {
		if (tw[shade] !== undefined) {
			result[shade] = tw[shade]
		}
	}
	return result
}

/**
 * Get the 500-shade color for a palette — used for swatch display.
 * Returns a CSS-ready color string.
 */
export function getPaletteColor(paletteName: string): string {
	if (isCustomPalette(paletteName)) {
		return `oklch(${customPalettes[paletteName][500]})`
	}
	return builtinPalette(paletteName)?.[500] ?? '#888'
}

// ── CSS variable application ────────────────────────────────────────────────

/**
 * Wrap a raw palette value into a CSS-ready color string.
 * Custom OKLCH values are bare "L C H" and need oklch() wrapping.
 * Tailwind hex values get converted via the OKLCH adapter.
 */
function wrapColor(value: string, isOklch: boolean): string {
	if (isOklch) {
		return `oklch(${value})`
	}
	return oklchAdapter.wrap(value) as string
}

/**
 * Build CSS-var declarations for a role + palette, as a string fragment that
 * can be inlined inside a `:root { … }` or `[data-mode="dark"] { … }` rule.
 */
function declarationsFor(role: string, paletteName: string): string {
	const paletteShades = getPaletteShades(paletteName)
	if (!paletteShades) return ''
	const isOklch = isCustomPalette(paletteName)
	const parts: string[] = []
	for (const shade of shades) {
		const value = paletteShades[shade]
		if (value !== undefined) {
			parts.push(`--color-${role}-${shade}:${wrapColor(value, isOklch)};`)
		}
	}
	const defaultValue = paletteShades[500]
	if (defaultValue !== undefined) {
		parts.push(`--color-${role}:${wrapColor(defaultValue, isOklch)};`)
	}
	return parts.join('')
}

const SKIN_STYLE_ID = 'koan-skin-overrides'

function getSkinStyleEl(): HTMLStyleElement | null {
	if (typeof document === 'undefined') return null
	let el = document.getElementById(SKIN_STYLE_ID) as HTMLStyleElement | null
	if (!el) {
		el = document.createElement('style')
		el.id = SKIN_STYLE_ID
		document.head.appendChild(el)
	}
	return el
}

/**
 * Track per-role overrides so `applyRoleColor` can update a single role
 * without losing other roles' applied palettes.
 *
 * Each role can map to either a single palette name (used for both modes)
 * or a `{ light, dark }` pair.
 */
const activeOverrides: Record<string, RoleMapping> = {}

/**
 * Build named-token aliases that point at the palette shades so the
 * theme CSS (which reads `var(--primary)`, `var(--paper)`, etc.) picks
 * up palette overrides written by `applyRoleColor`. Without these, the demo
 * runs in `tokens: 'core'` mode where named tokens are emitted as
 * inlined OKLCH values at config-build time — they don't reference
 * `--color-{role}-{shade}` and so palette overrides have no effect.
 *
 * Only emits aliases for roles the skin is overriding, so we don't
 * accidentally null out tokens whose source role wasn't touched.
 */
/**
 * Resolve the FIXED on-color hex for a derived `on-{role}` token from THAT
 * role's own 500 fill, luminance-picked via the shared `@rokkit/core` logic.
 *
 * The on-color must be FIXED (identical in light and dark) because it sits on a
 * fill that's the same in both modes — pointing it at a surface shade (the old
 * `var(--color-surface-50)`) flipped it with the canvas and made bright brand
 * fills unreadable. Returns null when the role's fill can't be resolved so the
 * caller can fall back to the previous behaviour.
 */
function derivedOnColorFor(role: string): string | null {
	const mapping = activeOverrides[role]
	if (!mapping) return null
	// A role can map to a single palette or a {light, dark} pair; the 500 fill is
	// the same hue in both, so the light palette (or the single name) is canonical.
	const paletteName = typeof mapping === 'string' ? mapping : mapping.light
	const paletteShades = getPaletteShades(paletteName)
	const fill = paletteShades?.[500]
	if (fill === undefined) return null
	// Custom palettes are bare OKLCH "L C H"; tailwind palettes are hex.
	const space = isCustomPalette(paletteName) ? 'oklch' : 'rgb'
	const y = relativeLuminance(fill, space)
	return pickOnColor(y)
}

function namedTokenAliases(roles: Set<string>): string {
	const lines: string[] = []
	for (const name of NAMED_TOKENS) {
		const shadeOrDerived = NAMED_TOKEN_SHADE_MAP[name as keyof typeof NAMED_TOKEN_SHADE_MAP]
		const role = NAMED_TOKEN_ROLE_MAP[name as keyof typeof NAMED_TOKEN_ROLE_MAP]
		if (shadeOrDerived === 'derived') {
			// on-{role} → FIXED on-color picked from THIS role's 500 fill luminance
			// (same value in light + dark — it sits on a mode-invariant fill).
			if (!roles.has(role)) continue
			const onColor = derivedOnColorFor(role)
			if (onColor !== null) {
				lines.push(`--${name}:${onColor};`)
			} else if (roles.has('surface')) {
				// Fallback to the previous behaviour if the fill can't be resolved.
				lines.push(`--${name}:var(--color-surface-50);`)
			}
			continue
		}
		if (!roles.has(role)) continue
		lines.push(`--${name}:var(--color-${role}-${shadeOrDerived});`)
	}
	return lines.join('')
}

/**
 * Light and dark declaration lists for the active overrides. A single palette
 * name applies to light only (dark inherits); a `{light,dark}` pair fills both.
 */
function overrideDeclarations() {
	const light: string[] = []
	const dark: string[] = []
	for (const [role, mapping] of Object.entries(activeOverrides)) {
		if (typeof mapping === 'string') {
			light.push(declarationsFor(role, mapping))
		} else {
			light.push(declarationsFor(role, mapping.light))
			dark.push(declarationsFor(role, mapping.dark))
		}
	}
	return { light, dark }
}

/** One CSS rule, or `''` when it would have an empty body. */
const cssBlock = (selector: string, decls: string[], aliases: string) =>
	decls.length || aliases ? `${selector}{${decls.join('')}${aliases}}` : ''

function rewriteSkinStyle() {
	const el = getSkinStyleEl()
	if (!el) return
	const { light, dark } = overrideDeclarations()
	// Named-token aliases — only for roles in the override set. Lets
	// theme CSS reading `var(--primary)` etc. follow palette swaps.
	//
	// Aliases must be emitted in BOTH the `:root` and `[data-mode="dark"]`
	// blocks because the UnoCSS preflight emits a sizeable
	// `[data-mode="dark"] { --primary: <inlined value>; ... }` rule that
	// otherwise wins over our `:root` skin block in dark mode (the body
	// has `data-mode="dark"`, so descendants see the dark block's value).
	// Pointing them at the same `var(--color-{role}-{shade})` keeps both
	// modes in sync — for single-palette skins the palette vars are
	// only defined at :root, so the dark alias just resolves to the
	// light palette value.
	const aliases = namedTokenAliases(new Set(Object.keys(activeOverrides)))
	el.textContent = cssBlock(':root', light, aliases) + cssBlock('[data-mode="dark"]', dark, aliases)
}

/**
 * Apply a single role override — replaces the role's mapping (preserving the
 * other roles) and re-emits the style element.
 *
 * Accepts either a single palette name (applies to both modes) or a
 * `{ light, dark }` pair for explicit dual-palette overrides.
 */
export function applyRoleColor(role: string, palette: RoleMapping): void {
	activeOverrides[role] = palette
	rewriteSkinStyle()
}
