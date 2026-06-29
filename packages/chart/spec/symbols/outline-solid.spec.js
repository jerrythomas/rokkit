import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import OutlineSvelte from '../../src/symbols/outline.svelte'
import SolidSvelte from '../../src/symbols/solid.svelte'

describe('symbols/outline.svelte', () => {
	it('renders an SVG element', () => {
		const { container } = render(OutlineSvelte)
		expect(container.querySelector('svg')).toBeTruthy()
	})

	it('has the expected outline symbol paths (fill="none" stroke="currentColor")', () => {
		const { container } = render(OutlineSvelte)
		const svg = container.querySelector('svg')
		// The outline variant uses stroke with fill="none" for the dot group
		const dotGroup = svg.querySelector('g[aria-label="dot"]')
		expect(dotGroup).toBeTruthy()
		expect(dotGroup.getAttribute('fill')).toBe('none')
		expect(dotGroup.getAttribute('stroke')).toBe('currentColor')
	})

	it('renders axis tick marks', () => {
		const { container } = render(OutlineSvelte)
		const tickGroup = container.querySelector('[aria-label="x-axis tick"]')
		expect(tickGroup).toBeTruthy()
		expect(tickGroup.querySelectorAll('path').length).toBeGreaterThan(0)
	})

	it('renders axis tick labels', () => {
		const { container } = render(OutlineSvelte)
		const labelGroup = container.querySelector('[aria-label="x-axis tick label"]')
		expect(labelGroup).toBeTruthy()
		const texts = labelGroup.querySelectorAll('text')
		expect(texts.length).toBeGreaterThan(0)
	})

	it('has correct SVG dimensions', () => {
		const { container } = render(OutlineSvelte)
		const svg = container.querySelector('svg')
		expect(svg.getAttribute('width')).toBe('688')
		expect(svg.getAttribute('height')).toBe('60')
	})
})

describe('symbols/solid.svelte', () => {
	it('renders an SVG element', () => {
		const { container } = render(SolidSvelte)
		expect(container.querySelector('svg')).toBeTruthy()
	})

	it('has filled dot group (no stroke="currentColor" on the dot group)', () => {
		const { container } = render(SolidSvelte)
		const svg = container.querySelector('svg')
		// The solid variant has no fill/stroke attrs on dot group — it inherits fill from the SVG
		const dotGroup = svg.querySelector('g[aria-label="dot"]')
		expect(dotGroup).toBeTruthy()
		// The solid group does NOT set fill="none"
		expect(dotGroup.getAttribute('fill')).not.toBe('none')
	})

	it('renders axis tick marks', () => {
		const { container } = render(SolidSvelte)
		const tickGroup = container.querySelector('[aria-label="x-axis tick"]')
		expect(tickGroup).toBeTruthy()
		expect(tickGroup.querySelectorAll('path').length).toBeGreaterThan(0)
	})

	it('renders axis tick labels', () => {
		const { container } = render(SolidSvelte)
		const labelGroup = container.querySelector('[aria-label="x-axis tick label"]')
		expect(labelGroup).toBeTruthy()
		const texts = labelGroup.querySelectorAll('text')
		expect(texts.length).toBeGreaterThan(0)
	})

	it('has correct SVG dimensions', () => {
		const { container } = render(SolidSvelte)
		const svg = container.querySelector('svg')
		expect(svg.getAttribute('width')).toBe('688')
		expect(svg.getAttribute('height')).toBe('60')
	})

	it('renders symbol paths inside the dot group', () => {
		const { container } = render(SolidSvelte)
		const dotGroup = container.querySelector('g[aria-label="dot"]')
		const paths = dotGroup.querySelectorAll('path')
		expect(paths.length).toBeGreaterThan(0)
	})
})
