import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import DefinePatterns from '../../src/elements/DefinePatterns.svelte'
import StubPattern from '../helpers/StubPattern.svelte'

/**
 * The component destructures `{ id, component, fill, stroke }`. This spec used to
 * pass `name` instead, so every pattern's `id` was `undefined`, `uniq` collapsed
 * them to one entry, and `names.length < patterns.length` sent EVERY case down
 * the error branch — including the two named "should render the patterns". Three
 * snapshots had recorded that `<error>` element as the expected output.
 *
 * The duplicate-name case passed for the wrong reason too: it was detecting two
 * undefined ids rather than two identical ones.
 *
 * Assertions are explicit rather than snapshots now — a snapshot of the wrong
 * branch is exactly what hid this.
 *
 * It also imported `{ Circles, Triangles }` from `src/patterns`, which exports
 * NEITHER — both were undefined, so `<Component />` rendered an empty comment.
 * This component's contract wants a Svelte component per pattern, but the package
 * has no such components any more (the live `src/patterns/DefinePatterns.svelte`
 * takes mark DATA and renders it through `PatternDef`), so the spec supplies a
 * stub. See the note in docs/backlog about src/elements being unreachable.
 */

describe('DefinePatterns.svelte', () => {
	beforeEach(() => cleanup())

	it('renders nothing when no patterns are provided', () => {
		const { container } = render(DefinePatterns)

		expect(container.querySelector('defs')).toBeNull()
		expect(container.querySelector('error')).toBeNull()
	})

	it('renders an error when pattern ids are not unique', () => {
		const patterns = [
			{ id: 'dup', component: StubPattern },
			{ id: 'dup', component: StubPattern }
		]
		const { container } = render(DefinePatterns, { patterns })

		expect(container.querySelector('error')).toBeTruthy()
		expect(container.querySelector('defs')).toBeNull()
	})

	it('renders one <pattern> per entry when ids are unique', () => {
		const patterns = [
			{ id: 'circles', component: StubPattern },
			{ id: 'triangles', component: StubPattern }
		]
		const { container } = render(DefinePatterns, { patterns })

		expect(container.querySelector('error')).toBeNull()
		const defs = container.querySelector('defs')
		expect(defs).toBeTruthy()
		const rendered = defs.querySelectorAll('pattern')
		expect(rendered).toHaveLength(2)
		expect([...rendered].map((p) => p.getAttribute('id'))).toEqual(['circles', 'triangles'])
	})

	it('sizes each tile and defaults patternUnits to userSpaceOnUse', () => {
		const patterns = [{ id: 'circles', component: StubPattern }]
		const { container } = render(DefinePatterns, { patterns, size: 24 })

		const pattern = container.querySelector('pattern')
		expect(pattern.getAttribute('width')).toBe('24')
		expect(pattern.getAttribute('height')).toBe('24')
		expect(pattern.getAttribute('patternUnits')).toBe('userSpaceOnUse')
	})

	it('honours an explicit patternUnits', () => {
		const patterns = [{ id: 'circles', component: StubPattern }]
		const { container } = render(DefinePatterns, { patterns, patternUnits: 'objectBoundingBox' })

		expect(container.querySelector('pattern').getAttribute('patternUnits')).toBe(
			'objectBoundingBox'
		)
	})

	it('passes fill and stroke through to each pattern component', () => {
		const patterns = [
			{ id: 'circles', component: StubPattern, fill: 'red', stroke: 'blue' },
			{ id: 'triangles', component: StubPattern, fill: 'green', stroke: 'yellow' }
		]
		const { container } = render(DefinePatterns, { patterns })

		expect(container.querySelectorAll('pattern > *').length).toBeGreaterThan(0)
		const markup = container.innerHTML
		expect(markup).toContain('red')
		expect(markup).toContain('blue')
		expect(markup).toContain('green')
		expect(markup).toContain('yellow')
	})
})
