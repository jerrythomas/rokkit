import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import Root from '../../src/Plot/Root.svelte'
import mpg from '../fixtures/mpg.json'

const data = mpg.slice(0, 10)

describe('Plot/Root.svelte', () => {
	it('renders an SVG element', () => {
		const { container } = render(Root, {
			props: { data, x: 'class', y: 'hwy', width: 400, height: 300 }
		})
		expect(container.querySelector('svg')).toBeTruthy()
	})

	it('renders data-plot-root attribute', () => {
		const { container } = render(Root, {
			props: { data, x: 'class', y: 'hwy', width: 400, height: 300 }
		})
		expect(container.querySelector('[data-plot-root]')).toBeTruthy()
	})

	it('renders data-plot-canvas group', () => {
		const { container } = render(Root, {
			props: { data, x: 'class', y: 'hwy', width: 400, height: 300 }
		})
		expect(container.querySelector('[data-plot-canvas]')).toBeTruthy()
	})

	it('reflects width and height props on SVG', () => {
		const { container } = render(Root, {
			props: { data, x: 'class', y: 'hwy', width: 500, height: 350 }
		})
		const svg = container.querySelector('svg')
		expect(Number(svg.getAttribute('width'))).toBe(500)
		expect(Number(svg.getAttribute('height'))).toBe(350)
	})

	it('renders with custom margin', () => {
		const { container } = render(Root, {
			props: {
				data,
				x: 'class',
				y: 'hwy',
				width: 400,
				height: 300,
				margin: { top: 30, right: 40, bottom: 50, left: 60 }
			}
		})
		const canvas = container.querySelector('[data-plot-canvas]')
		// translate should use margin.left and margin.top
		expect(canvas.getAttribute('transform')).toContain('60')
		expect(canvas.getAttribute('transform')).toContain('30')
	})

	it('renders with color channel', () => {
		const { container } = render(Root, {
			props: { data, x: 'class', y: 'hwy', color: 'drv', width: 400, height: 300 }
		})
		expect(container.querySelector('[data-plot-root]')).toBeTruthy()
	})

	it('renders with mode="dark"', () => {
		const { container } = render(Root, {
			props: { data, x: 'class', y: 'hwy', width: 400, height: 300, mode: 'dark' }
		})
		expect(container.querySelector('svg')).toBeTruthy()
	})

	it('renders with no props (defaults)', () => {
		const { container } = render(Root)
		expect(container.querySelector('svg')).toBeTruthy()
		expect(container.querySelector('[data-plot-root]')).toBeTruthy()
	})

	it('has aria-label on SVG', () => {
		const { container } = render(Root, {
			props: { data, x: 'class', y: 'hwy', width: 400, height: 300 }
		})
		const svg = container.querySelector('svg')
		expect(svg.getAttribute('aria-label')).toBeTruthy()
	})

	it('canvas group transform reflects default margin', () => {
		const { container } = render(Root, {
			props: { data, x: 'class', y: 'hwy', width: 400, height: 300 }
		})
		const canvas = container.querySelector('[data-plot-canvas]')
		// Default margin.left=50, margin.top=20
		expect(canvas.getAttribute('transform')).toContain('50')
		expect(canvas.getAttribute('transform')).toContain('20')
	})
})
