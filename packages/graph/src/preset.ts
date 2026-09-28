import { categoricalPalette } from '@rokkit/core'

/**
 * How open-ended groups are differentiated.
 *
 * `pattern` is the colour-blind- and print-safe path and reuses chart's patterns.js.
 * A `symbol` channel is deliberately NOT here in slice 1: the preset could emit a name, but
 * nothing renders a glyph (chart's Shape.svelte stays in chart), so it would be a documented
 * API that silently does nothing. It returns when it has a renderer.
 */
export type GraphChannel = 'color' | 'pattern'

export type GraphShades = { fill: string; stroke: string; label: string }

export type GraphPreset = {
	/** Palette family per KNOWN node kind. Kinds are also themeable in pure CSS. */
	kinds: Record<string, string>
	/** Ordered ramp assigned to open-ended group names, wrapping when exhausted. */
	groups: string[]
	shades: { light: GraphShades; dark: GraphShades }
	patterns: string[]
	using: GraphChannel
}

/**
 * Mirrors `createChartPreset`'s shape on purpose — a consumer who has met one
 * has met both. Shade picks differ from chart's because a cluster is a large
 * background area rather than a small mark.
 *
 * The `groups` ramp and the `patterns` list are chart's own leading entries, in
 * chart's order, so a graph and a chart on one page differentiate alike.
 */
export const defaultGraphPreset: GraphPreset = {
	kinds: {
		table: 'blue',
		view: 'emerald',
		matview: 'teal',
		function: 'amber',
		procedure: 'violet',
		enum: 'rose'
	},
	groups: ['blue', 'emerald', 'rose', 'amber', 'violet', 'sky', 'pink', 'teal'],
	shades: {
		light: { fill: '100', stroke: '400', label: '700' },
		dark: { fill: '900', stroke: '600', label: '200' }
	},
	patterns: ['diagonal', 'dots', 'triangles', 'hatch', 'lattice', 'swell', 'checkerboard', 'waves'],
	using: 'color'
}

export function createGraphPreset(overrides: Partial<GraphPreset> = {}): GraphPreset {
	return {
		...defaultGraphPreset,
		...overrides,
		kinds: { ...defaultGraphPreset.kinds, ...overrides.kinds },
		shades: {
			light: { ...defaultGraphPreset.shades.light, ...overrides.shades?.light },
			dark: { ...defaultGraphPreset.shades.dark, ...overrides.shades?.dark }
		}
	}
}

/**
 * Resolves group names to CSS custom properties.
 *
 * Returns custom properties rather than concrete fills so a theme or an app can
 * still override with one attribute rule — the JS decides the DEFAULT, never the
 * final paint.
 *
 * Assignment is by SORTED group name so a group keeps its colour when `arrange`
 * reorders the layout. Callers pass one name per NODE, so names are de-duplicated
 * first; otherwise the ramp would advance per node and two nodes in the same group
 * would disagree.
 */
export function resolveGroupStyles(
	groups: string[],
	mode: 'light' | 'dark',
	preset: GraphPreset = defaultGraphPreset
): Map<string, Record<string, string>> {
	const styles = new Map<string, Record<string, string>>()
	const ordered = [...new Set(groups)].sort()

	ordered.forEach((group, index) => {
		if (preset.using === 'pattern') {
			styles.set(group, { '--group-pattern': preset.patterns[index % preset.patterns.length] })
			return
		}

		const family = categoricalPalette[preset.groups[index % preset.groups.length]]
		const shades = preset.shades[mode]

		styles.set(group, {
			'--group-fill': family[shades.fill],
			'--group-stroke': family[shades.stroke],
			'--group-label': family[shades.label]
		})
	})

	return styles
}
