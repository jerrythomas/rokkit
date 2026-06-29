import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import LabelPill from '../../src/geoms/LabelPill.svelte'

describe('LabelPill.svelte', () => {
	it('renders a group element with data-plot-element="label"', () => {
		const { container } = render(LabelPill, { props: { x: 100, y: 50, text: 'Hello' } })
		expect(container.querySelector('[data-plot-element="label"]')).toBeTruthy()
	})

	it('renders the text content', () => {
		const { container } = render(LabelPill, { props: { x: 10, y: 20, text: 'World' } })
		const text = container.querySelector('text')
		expect(text.textContent).toBe('World')
	})

	it('applies transform with x and y coordinates', () => {
		const { container } = render(LabelPill, { props: { x: 42, y: 77, text: 'A' } })
		const g = container.querySelector('[data-plot-element="label"]')
		expect(g.getAttribute('transform')).toBe('translate(42,77)')
	})

	it('renders a background rect', () => {
		const { container } = render(LabelPill, { props: { x: 0, y: 0, text: 'Test' } })
		const rect = container.querySelector('rect')
		expect(rect).toBeTruthy()
		expect(rect.getAttribute('fill')).toBe('white')
		expect(rect.getAttribute('rx')).toBe('4')
	})

	it('uses default color #333 when color is not provided', () => {
		const { container } = render(LabelPill, { props: { x: 0, y: 0, text: 'X' } })
		const text = container.querySelector('text')
		expect(text.getAttribute('fill')).toBe('#333')
	})

	it('uses custom color when provided', () => {
		const { container } = render(LabelPill, { props: { x: 0, y: 0, text: 'X', color: 'red' } })
		const text = container.querySelector('text')
		expect(text.getAttribute('fill')).toBe('red')
	})

	it('computes width based on text length (min 36)', () => {
		// Short text: less than (36-12)/7 = ~3.4 chars → min width 36
		const { container: c1 } = render(LabelPill, { props: { x: 0, y: 0, text: 'Hi' } })
		const rect1 = c1.querySelector('rect')
		const w1 = Number(rect1.getAttribute('width'))
		expect(w1).toBe(36)

		// Longer text: 20 chars * 7 + 12 = 152
		const { container: c2 } = render(LabelPill, { props: { x: 0, y: 0, text: 'a'.repeat(20) } })
		const rect2 = c2.querySelector('rect')
		const w2 = Number(rect2.getAttribute('width'))
		expect(w2).toBe(152)
	})

	it('has pointer-events="none" on the group', () => {
		const { container } = render(LabelPill, { props: { x: 5, y: 5, text: 'P' } })
		const g = container.querySelector('[data-plot-element="label"]')
		expect(g.getAttribute('pointer-events')).toBe('none')
	})

	it('text has text-anchor="middle"', () => {
		const { container } = render(LabelPill, { props: { x: 0, y: 0, text: 'Center' } })
		const text = container.querySelector('text')
		expect(text.getAttribute('text-anchor')).toBe('middle')
	})

	it('text has font-weight="600"', () => {
		const { container } = render(LabelPill, { props: { x: 0, y: 0, text: 'Bold' } })
		const text = container.querySelector('text')
		expect(text.getAttribute('font-weight')).toBe('600')
	})
})
