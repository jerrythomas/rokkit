import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const read = (p) => readFileSync(join(process.cwd(), 'packages/themes/src', p), 'utf-8')

/** Rules mentioning `selector`, split on `}` so a multi-line rule stays intact. */
const rulesFor = (file, selector) =>
	read(file)
		.split('}')
		.filter((rule) => rule.includes(selector))

describe('graph theme CSS', () => {
	it('is imported by both index files', () => {
		expect(read('base/index.css')).toContain('graph.css')
		expect(read('rokkit/index.css')).toContain('graph.css')
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

		for (const kind of ['table', 'view', 'matview', 'function', 'procedure', 'enum']) {
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
