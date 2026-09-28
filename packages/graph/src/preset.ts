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

/*
 * Node KINDS are deliberately absent from this type. The design splits the two
 * vocabularies: a kind is a closed set known at build time, so it is themed in pure CSS
 * (`[data-node-kind='table'] { --node-accent: … }`) with a rule per style. A group name is
 * open-ended and cannot be pre-written, which is the entire reason this preset exists.
 *
 * An earlier draft carried a `kinds` map here. Nothing ever read it — config that looks
 * live and silently does nothing is worse than no config at all.
 */
export type GraphPreset = {
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
	groups: ['blue', 'emerald', 'rose', 'amber', 'violet', 'sky', 'pink', 'teal'],
	// The label shade is measured against the FILL shade, not against paper: the cluster label
	// sits on the cluster. 700-on-100 came out at 3.63:1 for green — under the 4.5 text bar —
	// so the label sits two more steps away from its own background.
	shades: {
		light: { fill: '100', stroke: '400', label: '900' },
		dark: { fill: '900', stroke: '600', label: '100' }
	},
	patterns: ['diagonal', 'dots', 'triangles', 'hatch', 'lattice', 'swell', 'checkerboard', 'waves'],
	using: 'color'
}

export function createGraphPreset(overrides: Partial<GraphPreset> = {}): GraphPreset {
	return {
		...defaultGraphPreset,
		...overrides,
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
