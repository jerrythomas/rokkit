import { describe, it, expect, vi } from 'vitest'
import { tick } from 'svelte'
import { render } from '@testing-library/svelte'
import Root from '../../src/Plot/Root.svelte'
import mpg from '../fixtures/mpg.json'

const data = mpg.slice(0, 10)
const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve()))

describe('Plot/Root.svelte', () => {
	it('renders an SVG element', () => {
		const { container } = render(Root, {
			props: { data, x: 'class', y: 'hwy', width: 400, height: 300 }
		})
		expect(container.querySelector('svg')).toBeTruthy()
	})

	it('wraps the svg in a full-width responsive container (stretches to fill the stage)', () => {
		const { container } = render(Root, {
			props: { data, x: 'class', y: 'hwy', width: 400, height: 300 }
		})
		const wrapper = container.querySelector('.plot-root-container')
		expect(wrapper).toBeTruthy()
		expect(wrapper.querySelector('svg[data-plot-root]')).toBeTruthy()
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

describe('Plot/Root.svelte — data-plot-animate gating', () => {
	const rootOf = (container) => container.querySelector('[data-plot-root]')

	it('does not set data-plot-animate on the initial paint', () => {
		// The attribute is added only AFTER mount so the first layout paints
		// un-animated (marks otherwise "slide in" from their prior geometry).
		const { container } = render(Root, {
			props: { data, x: 'class', y: 'hwy', width: 400, height: 300 }
		})
		expect(rootOf(container).hasAttribute('data-plot-animate')).toBe(false)
	})

	it('sets data-plot-animate one frame after mount (default animate=true)', async () => {
		const { container } = render(Root, {
			props: { data, x: 'class', y: 'hwy', width: 400, height: 300 }
		})
		await vi.waitFor(() => {
			expect(rootOf(container).hasAttribute('data-plot-animate')).toBe(true)
		})
	})

	it('never sets data-plot-animate when animate={false} (AnimatedPlot opt-out)', async () => {
		const { container } = render(Root, {
			props: { data, x: 'class', y: 'hwy', width: 400, height: 300, animate: false }
		})
		// Wait past the frame that would have enabled it, then confirm it stayed off.
		await nextFrame()
		await nextFrame()
		await tick()
		expect(rootOf(container).hasAttribute('data-plot-animate')).toBe(false)
	})
})
