import { categoricalPalette, pickOnColor, relativeLuminance } from '@rokkit/core'

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

/**
 * The sequential ramp a share is shaded on (#164): a palette family and the two steps it runs
 * between. Unlike `groups` this is ORDINAL — more of the measure is more of the colour.
 */
export type GraphShadeRamp = { family: string; from: string; to: string }

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
	/** The ramp a `shadeBy` share is painted on (#164). Independent of `using`. */
	shade: GraphShadeRamp
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
	using: 'color',
	// Neutral, so a shade never reads as a group's hue. The palette has no `slate`.
	shade: { family: 'gray', from: '50', to: '900' }
}

export function createGraphPreset(overrides: Partial<GraphPreset> = {}): GraphPreset {
	return {
		...defaultGraphPreset,
		...overrides,
		shades: {
			light: { ...defaultGraphPreset.shades.light, ...overrides.shades?.light },
			dark: { ...defaultGraphPreset.shades.dark, ...overrides.shades?.dark }
		},
		shade: { ...defaultGraphPreset.shade, ...overrides.shade }
	}
}

/** The family's steps from `from` to `to`, in that order — reversed in dark mode. */
function rampSteps(ramp: GraphShadeRamp, mode: 'light' | 'dark'): string[] {
	const family = categoricalPalette[ramp.family] ?? categoricalPalette[defaultGraphPreset.shade.family]
	const [lo, hi] = [Number(ramp.from), Number(ramp.to)].sort((a, b) => a - b)
	const steps = Object.keys(family)
		.map(Number)
		.filter((step) => step >= lo && step <= hi)
		.sort((a, b) => a - b)
		.map((step) => family[String(step)])
	// In dark mode the paper is dark, so "more ink" runs toward the light end.
	return mode === 'dark' ? steps.reverse() : steps
}

/**
 * A share in 0..1 as custom properties, the way `resolveGroupStyles` resolves a group: the
 * ramp step nearest the share for the fill, two steps on for the stroke, and a label MEASURED
 * against that fill — rokkit's auto on-color (near-black or near-white by luminance), so the
 * flip point falls out of the ramp instead of being guessed.
 */
export function resolveShade(
	share: number,
	mode: 'light' | 'dark',
	preset: GraphPreset = defaultGraphPreset
): Record<'--group-fill' | '--group-stroke' | '--group-label', string> {
	const steps = rampSteps(preset.shade, mode)
	const at = Math.round(Math.min(1, Math.max(0, share)) * (steps.length - 1))
	const fill = steps[at]
	return {
		'--group-fill': fill,
		'--group-stroke': steps[Math.min(steps.length - 1, at + 2)],
		'--group-label': pickOnColor(relativeLuminance(fill))
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
