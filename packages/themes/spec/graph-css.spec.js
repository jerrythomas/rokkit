import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const read = (p) => readFileSync(join(process.cwd(), 'packages/themes/src', p), 'utf-8')

/**
 * The file with comments stripped. Rule-level guards below match on declarations, and a
 * comment that merely *describes* a property ("the utility sets background-color") would
 * otherwise read as the property itself.
 */
const declarations = (p) => read(p).replace(/\/\*[\s\S]*?\*\//g, '')

/**
 * Every style that ships a graph. The colour rules below run against ALL of them: each
 * style is self-contained (zen-sumi imports its own component CSS, never rokkit's), so a
 * guard that only checked rokkit would let the same contrast bug ship four more times.
 */
const STYLES = ['rokkit', 'minimal', 'material', 'frosted', 'zen-sumi']

/** Rules mentioning `selector`, split on `}` so a multi-line rule stays intact. */
const rulesFor = (file, selector) =>
	read(file)
		.split('}')
		.filter((rule) => rule.includes(selector))

describe('graph theme CSS', () => {
	it('is imported by base and by every style', () => {
		expect(read('base/index.css')).toContain('graph.css')
		for (const style of STYLES) {
			expect(read(`${style}/index.css`), style).toContain('graph.css')
		}
	})

	// Every kind `DEFAULT_ICONS` can produce. `materialized_view` and `trigger` are dbd v2's
	// WIRE strings — a real schema emits those, not `matview`, and a style that only knows
	// `matview` renders half of dbd's objects with no accent at all.
	const KINDS = [
		'table',
		'view',
		'matview',
		'materialized_view',
		'function',
		'procedure',
		'trigger',
		'enum'
	]

	it.each(STYLES)('%s styles every node kind the preset names', (style) => {
		const css = read(`${style}/graph.css`)

		for (const kind of KINDS) {
			expect(css, `${style} / ${kind}`).toContain(`[data-node-kind='${kind}']`)
		}
	})

	it.each(STYLES)('%s paints a cluster as a TINT, never a solid slab', (style) => {
		// The group ramp resolves to a deep saturated shade in dark (#07591d for a green
		// schema). Opaque, that is a vivid slab reading louder than the cards inside it, and it
		// fights any restrained UI around it — measured against dbd's cool
		// oklch(0.225 0.037 245). Unconditional rather than dark-only, so a cluster is the
		// same object in both modes.
		const css = read(`${style}/graph.css`)
		const rule = css.match(
			new RegExp(`\\[data-style='${style}'\\] \\[data-graph-cluster\\]\\s*\\{[^}]*\\}`)
		)?.[0]

		expect(rule, `${style} has no cluster rule`).toBeTruthy()
		expect(rule).toContain('color-mix')
		expect(rule).toContain('transparent')
	})

	it.each(STYLES)('%s draws a nested cluster as a subdivision, not a second region', (style) => {
		// base/graph.css can size the inner box but not colour it. A style that forgets it
		// leaves the subdivision inheriting the OUTER box's fill, so two nested groups read as
		// two unrelated clusters that happen to overlap.
		const css = read(`${style}/graph.css`)

		expect(css, style).toContain("[data-cluster-depth='1']")
	})

	it.each(STYLES)('%s tones the kind tag down from the title', (style) => {
		// base/graph.css sizes it but cannot colour it (headless-base rule), so a style that
		// forgets it inherits full-contrast ink and the tag competes with the node's NAME.
		const css = read(`${style}/graph.css`)

		expect(css, style).toContain('[data-graph-node-kind]')
	})

	it.each(STYLES)('%s gives materialized_view the same accent as its matview alias', (style) => {
		// One object, two spellings. Different colours for the same thing would read as two
		// different kinds sitting side by side in one diagram.
		const css = read(`${style}/graph.css`)
		const accentOf = (kind) =>
			css.match(
				new RegExp(`\\[data-node-kind='${kind}'\\][^{]*\\{[^}]*--node-accent:\\s*([^;]+);`)
			)?.[1]

		expect(accentOf('materialized_view')).toBe(accentOf('matview'))
	})

	it.each(STYLES)('%s never uses a brand colour as a FOREGROUND colour', (style) => {
		// The 500 sits around 2.4:1 on paper, so `color: var(--primary)` fails WCAG AA as text
		// wherever it lands. Measured at 2.39:1 on the rokkit relationship label before this
		// rule existed; the other four styles were written against it from the start.
		const offenders = declarations(`${style}/graph.css`)
			.split('}')
			.filter((rule) =>
				/(^|[;{\s])color:\s*var\(--(primary|accent|success|warning|danger|error|info)\b/.test(rule)
			)

		expect(offenders, style).toEqual([])
	})

	it.each(STYLES)('%s pairs a primary fill with its auto on-color', (style) => {
		const rules = read(`${style}/graph.css`)
			.split('}')
			.filter((rule) => /background-color:\s*var\(--primary\)/.test(rule))

		expect(rules.length, style).toBeGreaterThan(0)
		for (const rule of rules) expect(rule, style).toMatch(/color:\s*var\(--on-primary\)/)
	})

	it.each(STYLES)('%s colours the icon badge rather than filling it', (style) => {
		// Inside a node card the badge is a masked icon whose UnoCSS utility sets
		// `background-color: currentColor`, so a chip fill never lands — it measured 1.02:1,
		// near-black on near-black, when rokkit tried it.
		const rules = declarations(`${style}/graph.css`)
			.split('}')
			.filter((rule) => rule.includes('[data-graph-row] [data-row-badge]'))

		expect(rules.length, style).toBeGreaterThan(0)
		for (const rule of rules) expect(rule, style).not.toMatch(/background-color/)
	})

	it.each(STYLES)('%s gives every --group-* read a named-token fallback', (style) => {
		// resolveGroupStyles only sets --group-* for nodes that HAVE a group, so an ungrouped
		// graph would otherwise paint with an empty value and render invisible.
		const css = read(`${style}/graph.css`)

		for (const prop of ['--group-fill', '--group-stroke', '--group-label']) {
			const uses = css.match(new RegExp(`var\\(${prop}[^)]*\\)`, 'g')) ?? []
			expect(uses.length, `${style} / ${prop}`).toBeGreaterThan(0)
			for (const use of uses) expect(use, `${style} / ${prop} needs a fallback`).toContain(',')
		}
	})

	// A colour token or literal in base/ bleeds into every style and makes a missing theme
	// override invisible instead of actionable.
	//
	// Every colour FORM, not just the three the first draft of this test checked. A guard that
	// catches oklch/hex/named-token but waves through `hsl()`, `color-mix()` or a bare `red`
	// does not enforce the invariant the checkpoint claims it does.
	it.each([
		[
			'named tokens',
			/var\(--(paper|ink|primary|accent|success|warning|danger|error|info|focus-ring|shadow-tint|on-)[a-z-]*\)/
		],
		['hex literals', /#[0-9a-fA-F]{3,8}\b/],
		['oklch()', /\boklch\(/],
		['oklab()', /\boklab\(/],
		['hsl()/hsla()', /\bhsla?\(/],
		['rgb()/rgba()', /\brgba?\(/],
		['lab()/lch()', /\bl(ab|ch)\(/],
		['hwb()', /\bhwb\(/],
		['color-mix()', /\bcolor-mix\(/],
		[
			'CSS named colours',
			/:\s*(red|green|blue|black|white|gray|grey|orange|purple|pink|yellow|teal|cyan|magenta)\s*[;!]/
		]
	])('keeps base structural — no %s', (_form, pattern) => {
		expect(read('base/graph.css')).not.toMatch(pattern)
	})

	it('does assert on a non-empty file — the guard above is vacuous on an empty one', () => {
		expect(read('base/graph.css').length).toBeGreaterThan(200)
	})

	it('keeps the card geometry in step with layout/constants.ts', () => {
		// The layout computes card heights from these exact numbers and nothing measures the
		// DOM, so a CSS row height that disagrees renders rows that overflow their own card.
		const base = read('base/graph.css')

		expect(base).toContain('--graph-head-h: 40px')
		expect(base).toContain('--graph-row-h: 24px')
		expect(base).toContain('--graph-more-h: 22px')
	})

	it('styles every node kind the preset names', () => {
		const rokkit = read('rokkit/graph.css')

		for (const kind of KINDS) {
			expect(rokkit, kind).toContain(`[data-node-kind='${kind}']`)
		}
	})

	// ink-soft is the placeholder tone (ink.500, 1.95-2.13:1 on paper) and cannot carry an
	// interactive control's label or icon — the graph node card IS a button.
	//
	// Matched per RULE, not per line. A line-by-line filter cannot see this at all: normal CSS
	// puts the selector and the declaration on separate lines, so no single line carries both
	// `row-type` and `--ink-soft`, and the guard passes while the violation ships. That is
	// exactly the defect this test exists to catch.
	it.each(['data-graph-row-type', 'data-row-badge', 'data-graph-entity'])(
		'never puts ink-soft on %s',
		(selector) => {
			const rules = rulesFor('rokkit/graph.css', selector)

			expect(rules.length, `no rule found for ${selector}`).toBeGreaterThan(0)
			for (const rule of rules) expect(rule).not.toMatch(/--ink-soft/)
		}
	)

	it('puts ink-mute on the row type — the positive case, not just the absence', () => {
		const rules = rulesFor('rokkit/graph.css', 'data-graph-row-type')

		expect(rules.some((r) => /--ink-mute/.test(r))).toBe(true)
	})

	it('never uses a brand colour as a FOREGROUND colour', () => {
		// The 500 sits around 2.4:1 on paper, so `color: var(--primary)` fails WCAG AA as text
		// wherever it lands — measured at 2.39:1 on the relationship label and the pk badge
		// before this rule existed. Every other rokkit component already treats primary as a
		// fill or a border; this keeps graph in line. A brand fill pairs with `--on-primary`,
		// which is auto-computed for contrast.
		const offenders = read('rokkit/graph.css')
			.split('}')
			.filter((rule) => /(^|[;{\s])color:\s*var\(--(primary|accent|success|warning|danger|error|info)\b/.test(rule))

		expect(offenders).toEqual([])
	})

	it('pairs a primary fill with its auto on-color', () => {
		const rules = read('rokkit/graph.css')
			.split('}')
			.filter((rule) => /background-color:\s*var\(--primary\)/.test(rule))

		expect(rules.length).toBeGreaterThan(0)
		for (const rule of rules) expect(rule).toMatch(/color:\s*var\(--on-primary\)/)
	})

	it('backs the selected node with primary, never accent', () => {
		// text-on-accent compiles to a build-time-baked hex and cannot react to a skin;
		// only on-primary is a real CSS variable.
		const rules = rulesFor('rokkit/graph.css', "data-node-state='selected'")

		expect(rules.length).toBeGreaterThan(0)
		expect(rules.some((r) => /--primary/.test(r))).toBe(true)
		for (const rule of rules) expect(rule).not.toMatch(/var\(--accent\b/)
	})

	it('themes the dependency edge kind, so dbd#24 arrives styled', () => {
		expect(read('rokkit/graph.css')).toContain("[data-edge-kind='dependency']")
	})

	it('falls back to a named token whenever a group custom property is absent', () => {
		// resolveGroupStyles only sets --group-* for nodes that HAVE a group. An ungrouped
		// graph would otherwise paint with an empty value and render invisible cards.
		const rokkit = read('rokkit/graph.css')

		for (const prop of ['--group-fill', '--group-stroke', '--group-label']) {
			const uses = rokkit.match(new RegExp(`var\\(${prop}[^)]*\\)`, 'g')) ?? []
			expect(uses.length, prop).toBeGreaterThan(0)
			for (const use of uses) expect(use, `${prop} needs a fallback`).toContain(',')
		}
	})

	it('does not redefine the dotted canvas that graph-paper.css already provides', () => {
		expect(read('base/graph.css')).not.toContain('radial-gradient')
	})
})
