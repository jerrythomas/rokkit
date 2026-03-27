import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import Line from '../../src/Plot/Line.svelte'
import Area from '../../src/Plot/Area.svelte'
import Point from '../../src/Plot/Point.svelte'
import Arc from '../../src/Plot/Arc.svelte'

describe('Plot primitives (no context)', () => {
	it('Line renders without context', () => {
		const { container } = render(Line)
		// No context = brewer is undefined, renders nothing
		expect(container.querySelector('svg, path, g')).toBeNull()
	})

	it('Area renders without context', () => {
		const { container } = render(Area)
		expect(container.querySelector('svg, path, g')).toBeNull()
	})

	it('Point renders without context', () => {
		const { container } = render(Point)
		expect(container.querySelector('svg, circle, g')).toBeNull()
	})

	it('Arc renders without context', () => {
		const { container } = render(Arc)
		expect(container.querySelector('svg, path, g')).toBeNull()
	})
})
